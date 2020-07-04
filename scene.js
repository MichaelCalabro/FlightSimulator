
var canvas = document.getElementById("renderCanvas"); // Get the canvas element
var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

var camera;

var groundY = -5;

var groundMaxZ = 0;
var groundMinZ = 0;
var groundMaxX = 0;
var groundMinX = 0;

var groundTilesX = 10;
var groundTilesZ = 10;
var groundTileSize = 100;

var groundGridX = [0];
var groundGridZ = [0];


/******* Add the create scene function ******/
var createScene = function () {

    // Create the scene space
    var scene = new BABYLON.Scene(engine);

    //scene.clipPlane = new BABYLON.Plane(0,0, -1, 100);

    // Add a camera to the scene and attach it to the canvas
    //var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new BABYLON.Vector3(0,0,5), scene);
    
    camera = new BABYLON.UniversalCamera("Camera", new BABYLON.Vector3(0,0,-10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.maxZ = 10000;
    //camera.attachControl(canvas, true);

    // Add lights to the scene
    var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
    var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 1, -1), scene);
 

    createAirplane(camera);
    initTiledGround(groundTilesX, groundTilesZ, groundTileSize);
    createSkyBox(scene);

    
    var map = {}; //object for multiple key presses
    scene.actionManager = new BABYLON.ActionManager(scene);

    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";

    }));

    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        map[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
    }));


    //User input
    scene.registerAfterRender(function () {

        if ((map["w"] || map["W"])) {
            camera.position.x += camera.upVector.x * scene.getAnimationRatio();
            camera.position.y += camera.upVector.y * scene.getAnimationRatio();
            camera.position.z += camera.upVector.z * scene.getAnimationRatio();

            camera.rotation.x -= 0.005 * camera.upVector.y * scene.getAnimationRatio();
            camera.rotation.y -= 0.005 * camera.upVector.z * scene.getAnimationRatio();
            camera.rotation.z -= 0.005 * camera.upVector.x * scene.getAnimationRatio();

        };

        if ((map["s"] || map["S"])) {
            camera.position.x -= camera.upVector.x * scene.getAnimationRatio();
            camera.position.y -= camera.upVector.y * scene.getAnimationRatio();
            camera.position.z -= camera.upVector.z * scene.getAnimationRatio();

            camera.rotation.x += 0.005 * camera.upVector.y * scene.getAnimationRatio();
            camera.rotation.y += 0.005 * camera.upVector.z * scene.getAnimationRatio();
            camera.rotation.z -+ 0.005 * camera.upVector.x * scene.getAnimationRatio();

        };

        if ((map["d"] || map["D"])) {
            camera.position.x += 0.2 * scene.getAnimationRatio();
            camera.rotation.z -= 0.01 * scene.getAnimationRatio();
            camera.rotation.y += 0.01 * scene.getAnimationRatio();
        };

        if ((map["a"] || map["A"])) {
            camera.position.x -= 0.2 * scene.getAnimationRatio(); 
            camera.rotation.z += 0.01 * scene.getAnimationRatio();
            camera.rotation.y -= 0.01 * scene.getAnimationRatio();
        };

    });

    return scene;
};
/******* End of the create scene function ******/

var scene = createScene(); //Call the createScene function

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
        scene.render();

        var forwardVector = BABYLON.Ray.CreateNewFromTo(camera.position, camera.getTarget()).direction.normalize();
        var speed = 1;

        camera.position.x += forwardVector.x * speed * scene.getAnimationRatio();
        camera.position.y += forwardVector.y * speed * scene.getAnimationRatio();
        camera.position.z += forwardVector.z * speed * scene.getAnimationRatio();

        expandGround(camera.position, 500);

        //Reset 
        if(camera.position.y <= groundY){
            camera.position.x = 10;
            camera.position.y = 0;
            camera.position.z = 0;
            camera.rotation.x = 0;
            camera.rotation.y = 0;
            camera.rotation.z = 0;
        }
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
        engine.resize();
});

function createSkyBox(scene){

    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:10000.0}, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/textures/environment.dds", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    skybox.infiniteDistance = true;
}

function initTiledGround(xTiles, zTiles, tileSize){

    createTiledGround(xTiles, zTiles, tileSize, new BABYLON.Vector3(0,groundY,0));

    groundMaxZ = (zTiles * tileSize)/2;
    groundMinZ = -(zTiles * tileSize)/2;
    groundMaxX = (xTiles * tileSize)/2;
    groundMinX = -(xTiles * tileSize)/2;
}

function createTiledGround(xTiles, zTiles, tileSize, pos){

    var groundMat = new BABYLON.StandardMaterial("GroundMaterial", scene);
    groundMat.diffuseTexture = new BABYLON.Texture("assets/textures/grass.jpg", scene);
    groundMat.specularColor = new BABYLON.Color3(0.5, 0.6, 0.87);
    groundMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
    groundMat.ambientColor = new BABYLON.Color3(0.23, 0.98, 0.53);



    var anchorX = (xTiles * tileSize)/2 + pos.x;
    var anchorZ = (zTiles * tileSize)/2 + pos.z;

    //Surface plane
    for(x = 0; x < xTiles; x++){
        for(z = 0; z < zTiles; z++){
            var tile = BABYLON.MeshBuilder.CreateGround("ground", {width: tileSize, height: tileSize, subdivisions: 4}, scene);
            tile.position.x = (x * tileSize) - anchorX;
            tile.position.z = (z * tileSize) - anchorZ;
            tile.position.y = pos.y;

            tile.material = groundMat;

        }
    }

    //Random buildings
    for(i = 0; i < 500; i++){

        var bWidth = 4 + Math.random() * 8;
        var bHeight = 2 + Math.random() * 32;
        var bDepth = 4 + Math.random() * 8;

        var building = BABYLON.MeshBuilder.CreateBox("box", {width: bWidth, height: bHeight, depth: bDepth}, scene);

        building.position.x = (-1 + Math.random() * 2) * (xTiles * tileSize)/2 - tileSize - pos.x;
        building.position.z = (-1 + Math.random() * 2) * (zTiles * tileSize)/2 - tileSize - pos.z;
        building.position.y = groundY + bHeight/2;
    }


}



function createAirplane(camera){

    BABYLON.OBJFileLoader.OPTIMIZE_WITH_UV = true;
    //BABYLON.OBJFileLoader.COMPUTE_NORMALS = true;
    //BABYLON.OBJFileLoader.UV_SCALE = new BABYLON.Vector2(1, 0.5);
    BABYLON.OBJFileLoader.SKIP_MATERIALS = true;

    // Add and manipulate meshes in the scene
    BABYLON.SceneLoader.ImportMesh("","assets/objects/", "Airplane.obj", scene, function(newMeshes){
        var airplane = BABYLON.Mesh.MergeMeshes(newMeshes);

        airplane.rotation.y = -Math.PI/2;
        airplane.scaling.x = 0.2;
        airplane.scaling.y = 0.2;
        airplane.scaling.z = 0.2;
        
        airplane.position.z = 10;
        airplane.parent = camera;


        var airplaneMat = new BABYLON.StandardMaterial("AirplaneMaterial;", scene);
        airplaneMat.diffuseColor = new BABYLON.Color3(0.9,0.8,0.1);
        airplaneMat.specularColor = new BABYLON.Color3(0.5, 0.6, 0.87);
        airplaneMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
        airplaneMat.ambientColor = new BABYLON.Color3(0.23, 0.98, 0.53);
        //airplaneMat.wireframe = true;

        airplane.material = airplaneMat;
    })
}

function expandGround(cPos, threshold){

    var currentCellX = cPos.x >= 0 ? -Math.floor(cPos.x / (groundTilesX * groundTileSize))
        : -Math.ceil(cPos.x / (groundTilesX * groundTileSize));

    var currentCellZ = cPos.z >= 0 ? -Math.floor(cPos.z / (groundTilesZ * groundTileSize))
        : -Math.ceil(cPos.z / (groundTilesZ * groundTileSize))


    //Forward
    if(Math.abs(cPos.z - groundMaxZ) <= threshold){

        var segmentSize = (groundTilesZ * groundTileSize);

        groundGridX.forEach(cell => {
             createTiledGround(groundTilesX, groundTilesZ, groundTileSize, 
                new BABYLON.Vector3(cell * segmentSize, groundY, -(groundMaxZ + (segmentSize)/2)));
        });

        groundMaxZ += segmentSize;
        groundGridZ.push(currentCellZ - 1);     
    }

    //Right
    if(Math.abs(cPos.x - groundMaxX) <= threshold){

        var segmentSize = (groundTilesX * groundTileSize);

        groundGridZ.forEach(cell => {        
            createTiledGround(groundTilesX, groundTilesZ, groundTileSize, 
                new BABYLON.Vector3(-(groundMaxX + (segmentSize)/2), groundY, cell * segmentSize));
       });

        groundMaxX += segmentSize;
        groundGridX.push(currentCellX - 1);
    }

     //Left
     if(Math.abs(cPos.x - groundMinX) <= threshold){

        var segmentSize = (groundTilesX * groundTileSize);

        groundGridZ.forEach(cell => {         
            createTiledGround(groundTilesX, groundTilesZ, groundTileSize, 
                new BABYLON.Vector3(-(groundMinX - (segmentSize)/2), groundY, cell * segmentSize));
       });

        groundMinX -= segmentSize;
        groundGridX.push(currentCellX + 1);
    }

      //Back
      if(Math.abs(cPos.z - groundMinZ) <= threshold){

        var segmentSize = (groundTilesZ * groundTileSize);

        groundGridX.forEach(cell => {
             createTiledGround(groundTilesX, groundTilesZ, groundTileSize, 
                new BABYLON.Vector3(cell * segmentSize, groundY, -(groundMinZ - (segmentSize)/2)));
        });

        groundMinZ -= segmentSize;
        groundGridZ.push(currentCellZ + 1);     
    }

}