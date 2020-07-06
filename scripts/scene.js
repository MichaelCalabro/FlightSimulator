
var canvas = document.getElementById("renderCanvas"); // Get the canvas element
var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

var camera;

var groundY = -5;

var airplane;
var airplaneStartRotY = -Math.PI/2;

var groundManager;

var shadowGenerator;


/******* Add the create scene function ******/
var createScene = function () {

    // Create the scene space
    var scene = new BABYLON.Scene(engine);
    scene.ambientColor = new BABYLON.Color3(0.1,0.0,0.0);
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
    scene.fogDensity = 0.0008;
    scene.fogColor = new BABYLON.Color3(0.3,0.1,0.1,);

    // Add a camera to the scene and attach it to the canvas
    camera = new BABYLON.UniversalCamera("Camera", new BABYLON.Vector3(0,0,-10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.maxZ = 5000;
    camera.position.y = 50;

    // Add lights to the scene
    var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
    var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(10000, 100, 2500), scene);
    light1.intensity = 0.75;
    light2.intensity = 2;

    shadowGenerator = new BABYLON.ShadowGenerator(1024, light2);

    groundManager = new GroundManager(2,2,160,scene);

    groundManager.initTiledGround();

    createAirplane(camera);
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
        var pitchSpeed = 0.004;
        var yawSpeed = 0.01;
        var rollSpeed = 0.02;

        //Pitch up
        if ((map["w"] || map["W"])) {
            camera.rotation.x -= pitchSpeed * camera.upVector.y * scene.getAnimationRatio();
            camera.rotation.y += pitchSpeed * camera.upVector.x * scene.getAnimationRatio();
            camera.rotation.z -= pitchSpeed * camera.upVector.z * scene.getAnimationRatio();

            airplane.rotation.z = Math.min(airplane.rotation.z + 0.001 * scene.getAnimationRatio(), 0.05);
        };

        //Pitch down
        if ((map["s"] || map["S"])) {
            camera.rotation.x += pitchSpeed * camera.upVector.y * scene.getAnimationRatio();
            camera.rotation.y -= pitchSpeed * camera.upVector.x * scene.getAnimationRatio();
            camera.rotation.z += pitchSpeed * camera.upVector.z * scene.getAnimationRatio();

            airplane.rotation.z = Math.max(airplane.rotation.z - 0.001 * scene.getAnimationRatio(), -0.05);
        };

        //Yaw right
        if ((map["d"] || map["D"])) {
            camera.rotation.x += yawSpeed * camera.upVector.x * scene.getAnimationRatio();
            camera.rotation.y += yawSpeed * camera.upVector.y * scene.getAnimationRatio();
            camera.rotation.z -= yawSpeed * camera.upVector.z * scene.getAnimationRatio();
            
            airplane.rotation.y = Math.min(airplane.rotation.y + 0.001 * scene.getAnimationRatio(),
                airplaneStartRotY + 0.05);
        };

        //Yaw left
        if ((map["a"] || map["A"])) {
            camera.rotation.x -= yawSpeed * camera.upVector.x * scene.getAnimationRatio();
            camera.rotation.y -= yawSpeed * camera.upVector.y * scene.getAnimationRatio();
            camera.rotation.z += yawSpeed * camera.upVector.z * scene.getAnimationRatio();

            airplane.rotation.y = Math.max(airplane.rotation.y - 0.001 * scene.getAnimationRatio(),
                airplaneStartRotY - 0.05);
        };

        //Roll Right
        if ((map["e"] || map["E"])) {
            camera.rotation.z -= rollSpeed * scene.getAnimationRatio();
        };

        //Roll left
        if ((map["q"] || map["Q"])) {
            camera.rotation.z += rollSpeed * scene.getAnimationRatio();
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
        var speed = 2;

        camera.position.x += forwardVector.x * speed * scene.getAnimationRatio();
        camera.position.y += forwardVector.y * speed * scene.getAnimationRatio();
        camera.position.z += forwardVector.z * speed * scene.getAnimationRatio();

        groundManager.expandGround(camera.position, 1000);

        //Auto straighten plane
        if(airplane){
            
            if(airplane.rotation.z > 0.01){
                airplane.rotation.z -= 0.0005 * scene.getAnimationRatio();
            }
            else if(airplane.rotation.z < -0.01){
                airplane.rotation.z += 0.0005 * scene.getAnimationRatio();
            }

            if(airplane.rotation.y > airplaneStartRotY + 0.01){
                airplane.rotation.y-= 0.0005 * scene.getAnimationRatio();
            }
            else if(airplane.rotation.y < airplaneStartRotY - 0.01){
                airplane.rotation.y += 0.0005 * scene.getAnimationRatio();
            }
        }   

              //Reset 
        if(camera.position.y <= groundY){
            camera.position.x = 10;
            camera.position.y = 50;
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

    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:4000.0}, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/textures/environment.dds", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;

    skybox.infiniteDistance = true;
}

function createAirplane(camera){

    BABYLON.OBJFileLoader.OPTIMIZE_WITH_UV = true;
    //BABYLON.OBJFileLoader.COMPUTE_NORMALS = true;
    //BABYLON.OBJFileLoader.UV_SCALE = new BABYLON.Vector2(1, 0.5);
    BABYLON.OBJFileLoader.SKIP_MATERIALS = true;



    // Add and manipulate meshes in the scene
    BABYLON.SceneLoader.ImportMesh("","assets/objects/", "Airplane.obj", scene, function(newMeshes){
        var apMesh = BABYLON.Mesh.MergeMeshes(newMeshes);

        apMesh.name = "Airplane";
        apMesh.rotation.y = airplaneStartRotY;
        apMesh.scaling.x = 0.02;
        apMesh.scaling.y = 0.02;
        apMesh.scaling.z = 0.02;
        
        apMesh.position.z = 2;
        apMesh.parent = camera;


        var airplaneMat = new BABYLON.StandardMaterial("AirplaneMaterial;", scene);
        airplaneMat.diffuseColor = new BABYLON.Color3(0.9,0.8,0.1);
        airplaneMat.specularColor = new BABYLON.Color3(0.5, 0.6, 0.87);
        airplaneMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
        airplaneMat.ambientColor = new BABYLON.Color3(0.23, 0.98, 0.53);
        //airplaneMat.wireframe = true;

        apMesh.material = airplaneMat;
        shadowGenerator.addShadowCaster(apMesh);

        airplane = scene.getMeshByName("Airplane");

       
    });


}