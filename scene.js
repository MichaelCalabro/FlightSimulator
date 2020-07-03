
var canvas = document.getElementById("renderCanvas"); // Get the canvas element
var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

var camera;

/******* Add the create scene function ******/
var createScene = function () {

    // Create the scene space
    var scene = new BABYLON.Scene(engine);

    // Add a camera to the scene and attach it to the canvas
    //var camera = new BABYLON.ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new BABYLON.Vector3(0,0,5), scene);
    
    camera = new BABYLON.UniversalCamera("Camera", new BABYLON.Vector3(0,0,-10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    //camera.attachControl(canvas, true);

    // Add lights to the scene
    var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
    var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 1, -1), scene);
 

    var airplane = createAirplane(camera);
    createGround();
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
        var speed = 0.5;

        camera.position.x += forwardVector.x * speed * scene.getAnimationRatio();
        camera.position.y += forwardVector.y * speed * scene.getAnimationRatio();
        camera.position.z += forwardVector.z * speed * scene.getAnimationRatio();


});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
        engine.resize();
});

function createSkyBox(scene){

    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:1000.0}, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/textures/environment.dds", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    skybox.infiniteDistance = true;
}

function createGround(){
    var ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 1000, height: 1000, subdivisions: 4}, scene);
    ground.position.y = -5;

    var groundMat = new BABYLON.StandardMaterial("GroundMaterial", scene);
    groundMat.diffuseColor = new BABYLON.Color3(0,1,0);
    groundMat.specularColor = new BABYLON.Color3(0.5, 0.6, 0.87);
    groundMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
    groundMat.ambientColor = new BABYLON.Color3(0.23, 0.98, 0.53);

    ground.material = groundMat;
}

function createAirplane(camera){

    BABYLON.OBJFileLoader.OPTIMIZE_WITH_UV = true;
    BABYLON.OBJFileLoader.COMPUTE_NORMALS = true;
    BABYLON.OBJFileLoader.UV_SCALE = new BABYLON.Vector2(1, 0.5);
    //BABYLON.OBJFileLoader.SKIP_MATERIALS = true;

    // Add and manipulate meshes in the scene
    BABYLON.SceneLoader.ImportMesh("","assets/objects/", "Airplane.obj", scene, function(newMeshes){
        var airplane = BABYLON.Mesh.MergeMeshes(newMeshes);

        airplane.rotation.y = -Math.PI/2;
        airplane.scaling.x = 0.2;
        airplane.scaling.y = 0.2;
        airplane.scaling.z = 0.2;
        
        airplane.position.z = 10;
        airplane.parent = camera;


        // var airplaneMat = new BABYLON.StandardMaterial("AirplaneMaterial;", scene);
        // airplaneMat.diffuseColor = new BABYLON.Color3(0.9,0.8,0.1);
        // airplaneMat.specularColor = new BABYLON.Color3(0.5, 0.6, 0.87);
        // airplaneMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
        // airplaneMat.ambientColor = new BABYLON.Color3(0.23, 0.98, 0.53);

        // airplane.material = airplaneMat;
    })
}