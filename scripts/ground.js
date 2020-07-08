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
        this.cityMat = new BABYLON.StandardMaterial("GroundMaterial", scene);
        this.cityMat.diffuseTexture = new BABYLON.Texture("assets/textures/city.jpg", scene);
        this.cityMat.specularColor = new BABYLON.Color3(0, 0, 0);
        this.cityMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
        this.cityMat.ambientColor = new BABYLON.Color3(0.23, 0.98, 0.53);
        this.cityMat.diffuseColor = new BABYLON.Color3(0.5,0.5,0.5);
        this.cityMat.freeze();

        this.subUrbMat = new BABYLON.StandardMaterial("GroundMaterial", scene);
        this.subUrbMat.diffuseTexture = new BABYLON.Texture("assets/textures/suburb.jpg", scene);
        this.subUrbMat.specularColor = new BABYLON.Color3(0, 0, 0);
        this.subUrbMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
        this.subUrbMat.ambientColor = new BABYLON.Color3(0.23, 0.98, 0.53);
        this.subUrbMat.diffuseColor = new BABYLON.Color3(0.3,0.3,0.3);
        this.cityMat.freeze();

        this.farmlandMat = new BABYLON.StandardMaterial("GroundMaterial", scene);
        this.farmlandMat.diffuseTexture = new BABYLON.Texture("assets/textures/HITW-TS2-farm-mixed-2.jpg", scene);
        this.farmlandMat.specularColor = new BABYLON.Color3(0, 0, 0);
        this.farmlandMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
        this.farmlandMat.ambientColor = new BABYLON.Color3(0.23, 0.98, 0.53);
        this.farmlandMat.diffuseColor = new BABYLON.Color3(0.3,0.3,0.3);
        this.cityMat.freeze();
    
        this.buildingMat = new BABYLON.StandardMaterial("BuildingMaterial", scene);
        this.buildingMat.diffuseTexture = new BABYLON.Texture("assets/textures/building.jpg", scene);
        this.buildingMat.specularColor = new BABYLON.Color3(0.2,0.1,0.025);
        this.buildingMat.emissiveColor = new BABYLON.Color3(0.5, 0.4, 0.1);
        this.buildingMat.ambientColor = new BABYLON.Color3(0.0, 0.0, 0.0);
        this.cityMat.freeze();


        //Area profiles
        this.areaProfiles = [];
        this.areaProfiles.push(new AreaProfile(150, 4, 8, 4, 32, this.cityMat));
        this.areaProfiles.push(new AreaProfile(75, 4, 8, 4, 32, this.cityMat));
        this.areaProfiles.push(new AreaProfile(50, 4, 8, 2, 8, this.subUrbMat));
        this.areaProfiles.push(new AreaProfile(40, 4, 8, 2, 8, this.subUrbMat));
        this.areaProfiles.push(new AreaProfile(30, 4, 8, 2, 8, this.subUrbMat));
        this.areaProfiles.push(new AreaProfile(20, 4, 8, 2, 4, this.subUrbMat));
        this.areaProfiles.push(new AreaProfile(10, 4, 8, 2, 4, this.subUrbMat));
        this.areaProfiles.push(new AreaProfile(0, 2, 4, 2, 2, this.farmlandMat));
        this.areaProfiles.push(new AreaProfile(0, 2, 4, 2, 2, this.farmlandMat));
        this.areaProfiles.push(new AreaProfile(0, 2, 4, 2, 2, this.farmlandMat));
        this.areaProfiles.push(new AreaProfile(0, 2, 4, 2, 2, this.farmlandMat));
        this.areaProfiles.push(new AreaProfile(0, 2, 4, 2, 2, this.farmlandMat));
        this.areaProfiles.push(new AreaProfile(0, 2, 4, 2, 2, this.farmlandMat));
        this.areaProfiles.push(new AreaProfile(0, 2, 4, 2, 2, this.farmlandMat));
        this.areaProfiles.push(new AreaProfile(0, 2, 4, 2, 2, this.farmlandMat));
        this.areaProfiles.push(new AreaProfile(0, 2, 4, 2, 2, this.farmlandMat));
        this.areaProfiles.push(new AreaProfile(0, 2, 4, 2, 2, this.farmlandMat));
        this.areaProfiles.push(new AreaProfile(0, 2, 4, 2, 2, this.farmlandMat));
        this.areaProfiles.push(new AreaProfile(0, 2, 4, 2, 2, this.farmlandMat));

  
        //Building spacing
        this.buildingIntervals = [];
        for(var i = -1; i <= 1;){
                 
            for(var j = 0; j < 6; j++){
                this.buildingIntervals.push(i + (j * 0.01));
            }

            i += 0.15;
        }

        //Building face UV
        this.uvFactor = 8;

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
   
        var profile = this.areaProfiles[Math.floor(Math.random() * this.areaProfiles.length)];
    
        var groundMeshes = [];
        //Surface plane
        for(var x = 0; x < this.xTiles; x++){
            for(var z = 0; z < this.zTiles; z++){
                var tile = BABYLON.MeshBuilder.CreateGround("ground", {width: this.tileSize, height: this.tileSize, subdivisions: 4}, scene);

                tile.position.x = (x * this.tileSize) - anchorX;
                tile.position.z = (z * this.tileSize) - anchorZ;
                tile.position.y = pos.y;
    
                tile.material = profile.getMaterial();
                tile.receiveShadows = true;
                tile.freezeWorldMatrix();
                tile.cullingStrategy = BABYLON.AbstractMesh.CULLINGSTRATEGY_BOUNDINGSPHERE_ONLY;

                groundMeshes.push(tile);
                
            }
        }
    
             
        //Random buildings
        for(var i = 0; i < profile.getDensity(); i++){
    
            var bWidth = profile.getMinWidth() + Math.random() * profile.getMaxWidth();
            var bHeight = profile.getMinHeight() + Math.random() * profile.getMaxHeight();
            var bDepth = profile.getMinWidth() + Math.random() * profile.getMaxWidth();

            var bFaceUV = new Array(6);
            bFaceUV[0] = new BABYLON.Vector4(bWidth / this.uvFactor,0,0,bHeight / this.uvFactor);
            bFaceUV[1] = new BABYLON.Vector4(bWidth / this.uvFactor,0,0,bHeight / this.uvFactor);
            bFaceUV[2] = new BABYLON.Vector4(bHeight / this.uvFactor,0,0, bDepth / this.uvFactor);
            bFaceUV[3] =  new BABYLON.Vector4(bHeight / this.uvFactor,0,0, bDepth / this.uvFactor);
            bFaceUV[4] = new BABYLON.Vector4(0.01,0,0,0.01);
            bFaceUV[5] = new BABYLON.Vector4(1,0,0,1);
    
            var building = BABYLON.MeshBuilder.CreateBox("box", {width: bWidth, height: bHeight, depth: bDepth, faceUV: bFaceUV}, scene);
    
            building.position.x = this.buildingIntervals[Math.floor(Math.random() * this.buildingIntervals.length)] * (this.xTiles * this.tileSize)/2 - this.tileSize/2 - pos.x;
            building.position.z = this.buildingIntervals[Math.floor(Math.random() * this.buildingIntervals.length)] * (this.zTiles * this.tileSize)/2 - this.tileSize/2 - pos.z;
            building.position.y = groundY + bHeight/2;

            building.freezeWorldMatrix();
            building.convertToUnIndexedMesh();
            building.cullingStrategy = BABYLON.AbstractMesh.CULLINGSTRATEGY_BOUNDINGSPHERE_ONLY;
    
            building.material = this.buildingMat;
            groundMeshes.push(building);
        } 

        var fullGroundMesh = BABYLON.Mesh.MergeMeshes(groundMeshes, true, true, undefined, false, true);
        fullGroundMesh.receiveShadows = true;    
        fullGroundMesh.freezeWorldMatrix();
    }

    expandGround(cPos, threshold){
        
    
        //Forward
        if(Math.abs(cPos.z - this.groundMaxZ) <= threshold){
    
            var segmentSize = (this.zTiles * this.tileSize);

            this.groundGridX.forEach(cell => {
                this.createTiledGround(new BABYLON.Vector3(-cell * segmentSize, this.groundY, -(this.groundMaxZ + (segmentSize)/2)));
            });

            var leadCell = this.groundGridZ[0];
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

            var leadCell = this.groundGridX[0];
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

            var leadCell = this.groundGridX[0];
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

            var leadCell = this.groundGridZ[0];
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