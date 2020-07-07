
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
    camera.maxZ = 4000;
    camera.position.y = 50;
    camera.rotationQuaternion = new BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Zero(), 0);
    camera.attachControl(canvas, true);

    // Add lights to the scene
    var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
    var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(10000, 100, 2500), scene);
    light1.intensity = 0.75;
    light2.intensity = 2;

    shadowGenerator = new BABYLON.ShadowGenerator(1024, light2);

    createAirplane(camera);
    createSkyBox(scene);

    groundManager = new GroundManager(2,2,160,scene);
    groundManager.initTiledGround();

    
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
        var pitchSpeed = 0.01;
        var yawSpeed = 0.01;
        var rollSpeed = 0.02;

        var forward = BABYLON.Ray.CreateNewFromTo(camera.position, camera.getTarget()).direction.normalize();
        var up = camera.upVector;
        var side = BABYLON.Vector3.Cross(camera.upVector, forward);


        if ((map["r"] || map["R"])) {
            console.log("[" + camera.upVector.x.toFixed(2) + ", " + camera.upVector.y.toFixed(2) + ", " + camera.upVector.z.toFixed(2) + "]");
        };

        //Pitch up
        if ((map["w"] || map["W"])) {
            var quat = new BABYLON.Quaternion.RotationAxis(side, -pitchSpeed * scene.getAnimationRatio());
            camera.rotationQuaternion = quat.multiply(camera.rotationQuaternion);
            camera.rotationQuaternion.normalize();

            airplane.rotation.z = Math.min(airplane.rotation.z + 0.001 * scene.getAnimationRatio(), 0.05);
        };

        //Pitch down
        if ((map["s"] || map["S"])) {
            var quat = new BABYLON.Quaternion.RotationAxis(side, pitchSpeed * scene.getAnimationRatio());
            camera.rotationQuaternion = quat.multiply(camera.rotationQuaternion);
            camera.rotationQuaternion.normalize();

            airplane.rotation.z = Math.max(airplane.rotation.z - 0.001 * scene.getAnimationRatio(), -0.05);
        };

        //Yaw right
        if ((map["d"] || map["D"])) {
            var quat = new BABYLON.Quaternion.RotationAxis(up, yawSpeed * scene.getAnimationRatio());
            camera.rotationQuaternion = quat.multiply(camera.rotationQuaternion);
            camera.rotationQuaternion.normalize();
            
            airplane.rotation.y = Math.min(airplane.rotation.y + 0.001 * scene.getAnimationRatio(),
                airplaneStartRotY + 0.05);
        };

        //Yaw left
        if ((map["a"] || map["A"])) {
            var quat = new BABYLON.Quaternion.RotationAxis(up, -yawSpeed * scene.getAnimationRatio());
            camera.rotationQuaternion = quat.multiply(camera.rotationQuaternion);
            camera.rotationQuaternion.normalize();

            airplane.rotation.y = Math.max(airplane.rotation.y - 0.001 * scene.getAnimationRatio(),
                airplaneStartRotY - 0.05);
        };

        //Roll Right
        if ((map["e"] || map["E"])) {
            var quat = new BABYLON.Quaternion.RotationAxis(forward, -rollSpeed * scene.getAnimationRatio());
            camera.rotationQuaternion = quat.multiply(camera.rotationQuaternion);
            camera.rotationQuaternion.normalize();
        };

        //Roll left
        if ((map["q"] || map["Q"])) {
            var quat = new BABYLON.Quaternion.RotationAxis(forward, rollSpeed * scene.getAnimationRatio());
            camera.rotationQuaternion = quat.multiply(camera.rotationQuaternion);
            camera.rotationQuaternion.normalize();
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

        //Move forward
        camera.position.x += forwardVector.x * speed * scene.getAnimationRatio();
        camera.position.y += forwardVector.y * speed * scene.getAnimationRatio();
        camera.position.z += forwardVector.z * speed * scene.getAnimationRatio();

        groundManager.expandGround(camera.position, 2000);

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
            camera.rotationQuaternion = new BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Zero(), 0);
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
        airplaneMat.diffuseColor = new BABYLON.Color3(0.9,0.9,0.9);
        airplaneMat.specularColor = new BABYLON.Color3(0.2, 0.1, 0.1);
        airplaneMat.emissiveColor = new BABYLON.Color3(0.1, 0.05, 0.05);
        airplaneMat.ambientColor = new BABYLON.Color3(0.23, 0.98, 0.53);
        airplaneMat.diffuseTexture = new BABYLON.Texture("assets/textures/airplane.jpg", scene);
        //airplaneMat.wireframe = true;

        apMesh.material = airplaneMat;
        shadowGenerator.addShadowCaster(apMesh);

        airplane = scene.getMeshByName("Airplane");

    });

}