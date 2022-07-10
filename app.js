var simulationsCounter = 0;
function init() {
  simulationsCounter += 1;

  const currentGenerationSpan = document.getElementById("currentGeneration");

  const carCanvas = document.getElementById("carCanvas");
  carCanvas.width = 400;

  const networkCanvas = document.getElementById("networkCanvas");
  networkCanvas.width = 300;

  const carCtx = carCanvas.getContext("2d");
  const networkCtx = networkCanvas.getContext("2d");
  const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
  const N = 100;
  const cars = generateCars(N);
  let bestCar = cars[0];
  if (localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {
      cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
      if (i != 0) {
        NeuralNetwork.mutate(cars[i].brain, 0.1);
      }
    }
  }

  const traffic = [
    new Car(road.getLaneCenter(1), -100, 50, 90, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(0), -400, 50, 90, "DUMMY", 2, getRandomColor()),
    new Car(road.getLaneCenter(2), -400, 50, 90, "DUMMY", 2, getRandomColor()),
  ];

  animate();

  document.getElementById("save").addEventListener("click", function save() {
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
  });

  document.getElementById("discard", function discard() {
    localStorage.removeItem("bestBrain");
  });

  function generateCars(N) {
    const cars = [];
    for (let i = 0; i <= N; i++) {
      cars.push(new Car(road.getLaneCenter(1), 100, 50, 90, "AI"));
    }
    return cars;
  }

  function animate(time) {
    for (let i = 0; i < traffic.length; i++) {
      traffic[i].update(road.borders, []);
    }

    for (let i = 0; i < cars.length; i++) {
      cars[i].update(road.borders, traffic);

      //remove damaged cars from cars array
      // if (cars[i].damaged) {
      //   cars.splice(cars[i], 1);
      // }
    }

    // Math.min() doesn't work with arrays
    const bestCar = cars.find(
      (car) => car.y == Math.min(...cars.map((car) => car.y))
    );

    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    carCtx.save();
    carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);
    road.draw(carCtx);
    for (let i = 0; i < traffic.length; i++) {
      traffic[i].draw(carCtx, "red");
    }

    carCtx.globalAlpha = 0.2;

    for (let i = 0; i < cars.length; i++) {
      cars[i].draw(carCtx, "blue");
    }

    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx, "blue", true);

    carCtx.restore();

    networkCtx.lineDashOffset = time / 75;
    Visualizer.drawNetwork(networkCtx, bestCar.brain);
    requestAnimationFrame(animate); // infinitly calling animate

    // console.log(cars.length);
  }
}

function start() {
  init();
}

function restart() {
  document.getElementById("simulations").innerHTML = simulationsCounter;
  init();
}
