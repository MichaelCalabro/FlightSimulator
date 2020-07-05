class GroundManager {
 
    constructor(xTiles, zTiles, tileSize, scene){
       
        this.xTiles = xTiles;
        this.zTiles = zTiles;
        this.tileSize = tileSize;
        this.scene = scene;
       
        this.groundY = -5;

        this.groundMaxZ = 0;
        this.groundMinZ = 0;
        this.groundMaxX = 0;
        this.groundMinX = 0;
        
        this.groundGridX = [0];
        this.groundGridZ = [0];

        //Materials
        this.groundMat = new BABYLON.StandardMaterial("GroundMaterial", scene);
        this.groundMat.diffuseTexture = new BABYLON.Texture("assets/textures/farmland.jpg", scene);
        this.groundMat.specularColor = new BABYLON.Color3(0.3, 0.1, 0.1);
        this.groundMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
        this.groundMat.ambientColor = new BABYLON.Color3(0.23, 0.98, 0.53);
        this.groundMat.diffuseColor = new BABYLON.Color3(0.5,0.5,0.5);
    
        this.buildingMat = new BABYLON.StandardMaterial("BuildingMaterial", scene);
        this.buildingMat.diffuseTexture = new BABYLON.Texture("assets/textures/building.jpg", scene);
        this.buildingMat.specularColor = new BABYLON.Color3(0.1, 0.1, 0.0);
        this.buildingMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
        this.buildingMat.ambientColor = new BABYLON.Color3(0.0, 0.0, 0.0);


        //Area profiles
        this.areaProfiles = [];
        this.areaProfiles.push(new AreaProfile(100, 4, 8, 16, 32));
        this.areaProfiles.push(new AreaProfile(50, 4, 8, 2, 16));
        this.areaProfiles.push(new AreaProfile(10, 4, 8, 2, 8));
        this.areaProfiles.push(new AreaProfile(5, 4, 8, 2, 2));
        this.areaProfiles.push(new AreaProfile(0, 4, 8, 2, 2));


    }

    initTiledGround(){

        this.createTiledGround(new BABYLON.Vector3(0,groundY,0));
    
        this.groundMaxZ = (this.zTiles * this.tileSize)/2;
        this.groundMinZ = -(this.zTiles * this.tileSize)/2;
        this.groundMaxX = (this.xTiles * this.tileSize)/2;
        this.groundMinX = -(this.xTiles * this.tileSize)/2;
    }
    
    createTiledGround(pos){
          
        var anchorX = (this.xTiles * this.tileSize)/2 + pos.x;
        var anchorZ = (this.zTiles * this.tileSize)/2 + pos.z;

        var groundMeshes = [];
    
        //Surface plane
        for(var x = 0; x < this.xTiles; x++){
            for(var z = 0; z < this.zTiles; z++){
                var tile = BABYLON.MeshBuilder.CreateGround("ground", {width: this.tileSize, height: this.tileSize, subdivisions: 4}, scene);
                tile.position.x = (x * this.tileSize) - anchorX;
                tile.position.z = (z * this.tileSize) - anchorZ;
                tile.position.y = pos.y;
    
                tile.material = this.groundMat;
                tile.receiveShadows = true;
                groundMeshes.push(tile);
            }
        }
    
        var profile = this.areaProfiles[Math.floor(Math.random() * this.areaProfiles.length)];
    
        //Random buildings
        for(var i = 0; i < profile.getDensity(); i++){
    
            var bWidth = profile.getMinWidth() + Math.random() * profile.getMaxWidth();
            var bHeight = profile.getMinHeight() + Math.random() * profile.getMaxHeight();
            var bDepth = profile.getMinWidth() + Math.random() * profile.getMaxWidth();
    
            var building = BABYLON.MeshBuilder.CreateBox("box", {width: bWidth, height: bHeight, depth: bDepth}, scene);
    
            building.position.x = (-1 + Math.random() * 2) * (this.xTiles * this.tileSize)/2 - this.tileSize - pos.x;
            building.position.z = (-1 + Math.random() * 2) * (this.zTiles * this.tileSize)/2 - this.tileSize - pos.z;
            building.position.y = groundY + bHeight/2;
    
            building.material = this.buildingMat;

        } 

        var fullGroundMesh = BABYLON.Mesh.MergeMeshes(groundMeshes, true, true, undefined, false, true);
    }

    expandGround(cPos, threshold){
    
        //Forward
        if(Math.abs(cPos.z - this.groundMaxZ) <= threshold){
    
            var segmentSize = (this.zTiles * this.tileSize);

            this.groundGridX.forEach(cell => {
                this.createTiledGround(new BABYLON.Vector3(-cell * segmentSize, this.groundY, -(this.groundMaxZ + (segmentSize)/2)));
            });

            var leadCell = groundGridZ[0];
            this.groundGridZ.forEach(cell =>{
                if(cell > leadCell){
                    leadCell = cell;
                }
            });
    
            this.groundMaxZ += segmentSize;
            this.groundGridZ.push(leadCell + 1);     
        }
    
        //Right
        if(Math.abs(cPos.x - this.groundMaxX) <= threshold){

            var segmentSize = (this.xTiles * this.tileSize);
 
            this.groundGridZ.forEach(cell => {        
                this.createTiledGround(new BABYLON.Vector3(-(this.groundMaxX + (segmentSize)/2), this.groundY, -cell * segmentSize));
            });

            var leadCell = groundGridX[0];
            this.groundGridX.forEach(cell =>{
                if(cell > leadCell){
                    leadCell = cell;
                }
            });
    
           this.groundMaxX += segmentSize;
           this.groundGridX.push(leadCell + 1);
        }
    
        //Left
        if(Math.abs(cPos.x - this.groundMinX) <= threshold){
    
            var segmentSize = (this.xTiles * this.tileSize);
    
            this.groundGridZ.forEach(cell => {      
                this.createTiledGround(new BABYLON.Vector3(-(this.groundMinX - (segmentSize)/2), this.groundY, -cell * segmentSize));
            });

            var leadCell = groundGridX[0];
            this.groundGridX.forEach(cell =>{
                if(cell < leadCell){
                    leadCell = cell;
                }
            });
    
           this.groundMinX -= segmentSize;
           this.groundGridX.push(leadCell - 1);
        }
    
        //Back
        if(Math.abs(cPos.z - this.groundMinZ) <= threshold){
    
            var segmentSize = (this.zTiles * this.tileSize);
    
            this.groundGridX.forEach(cell => {
                this.createTiledGround(new BABYLON.Vector3(-cell * segmentSize, this.groundY, -(this.groundMinZ - (segmentSize)/2)));
            });

            var leadCell = groundGridZ[0];
            this.groundGridZ.forEach(cell =>{
                if(cell < leadCell){
                    leadCell = cell;
                }
            });
    
            this.groundMinZ -= segmentSize;
            this.groundGridZ.push(leadCell - 1);     
        }
    
    }
}