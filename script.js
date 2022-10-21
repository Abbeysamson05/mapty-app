'use strict';
//tell our extension to ignore the next line of code
// prettier-ignore
// const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

// let map = L.map('map').setView([51.505, -0.09], 13);

// L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//   attribution:
//     '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
// }).addTo(map);
// L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
//   attribution:
//     '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
// }).addTo(map);

// L.marker([51.5, -0.09])
//   .addTo(map)
//   .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
//   .openPopup();
// let map, leafEvent;
class WorkOut {
  //DATE AND ID ARE PUBLIC FIELDS THAT WE WANT TO BE ACCESSED BY THE DIFFERENT INSTANCES
  date = new Date();
  id = Date.now() + ''.slice(-10);
  constructor(coord, distance, duration) {
    this.coords = coord;
    this.distance = distance;
    this.duration = duration;
  }
  _setDescription() {
    //prettier - ignore;
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    }
    ${this.date.getDate()}`;
  }
}
class Running extends WorkOut {
  type = 'running';
  constructor(coord, distance, duration, cadence) {
    super(coord, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends WorkOut {
  type = 'cycling';
  constructor(coord, distance, duration, elevationGain) {
    super(coord, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}
// const run = new Running([12, 6], 120, 45, 178);
// const cycle = new Cycling([12, 6], 120, 45, 178);
// console.log(run, cycle);

class App {
  #map;
  #mapZoomLevel = 13;
  #leafEvent;
  #workouts = [];
  //CONSTRUCTOR FUNCTION IS IMMEDIATELY CALLED WHEN A NEW OBJECT IS CREATED FROM A CLASS...
  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkOut.bind(this));
    inputType.addEventListener('change', this._toogleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
  }
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        //RECALL THE THIS KEYWORD FOR A NORMAL FUNCTION IS ALWAYS UNDEFINED SO WE NEED TO BIND THE THIS-KEYWORD
        //THE BIND THIS THEN POINTS TO THE CURRENT OBJECT
        this._loadMap.bind(this),
        function () {
          alert('No co-ordinates info');
        }
      );
  }
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];
    console.log(`https://www.google.com/maps/@latitude,longitude,12z`);
    // console.log(position);
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
    //THE TILE LAYER IS WAH SHOWS THE MAP ON OUR PAGE
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    //THE MARKER IS WHAT GIVE THE LOCATOR POP UP ONCE WE DECLARE THE LATITUDE AND LONGITUDE
    L.marker(coords)
      .addTo(this.#map)
      //THE BELOW BINDPOPUP PROPERTY ISNT
      .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
      .openPopup();
    this.#map.on('click', this._showForm.bind(this));
  }
  _showForm(leafE) {
    this.#leafEvent = leafE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _hideForm() {
    inputDistance.value =
      inputCadence.value =
      inputDuration.value =
      inputElevation.value =
        '';
    //removing the animation thing, omo ehn
    form.style.display = 'none';
    form.classList.add('hidden');
    //returning the animation after 1sec
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }
  _toogleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _newWorkOut(e) {
    e.preventDefault();
    //get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#leafEvent.latlng;
    let workout;
    // console.log(typeof type);
    //If workout is running, create running object
    //rest parameters give birth to an array result dont forget bro
    // const validrun = (duration, distance, cadence);
    const validRun = (...inputs) => inputs.every(inp => Number.isFinite(inp));

    const allPositive = (...inputs) => inputs.every(inp => inp > 0);
    //SAME WAY AS WRITING THE ABOVE LINE OF CODE IS THE BELOW ONE
    // const validRunEx = function (...inputs) {
    //   inputs.every(inp => inp > 0);
    // };
    if (type === 'running') {
      const cadence = +inputCadence.value;
      //USING GUARD CLAUSE
      //EVEN IF I HAD ENTERED AN ALPHABET, DISTANCE WILL JUST CONVERT IT TO NUMBER AND THAT WILL BE WRONG SINCE I ONLY WANT TO DEAL WITH AN INTEGER
      //check if data is valid
      if (
        //reason for using the or is so that evem if one of them isnt a valid number
        //
        !validRun(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        // return alert('Wrong input data!');
        return alert(`${distance}, ${duration}, ${cadence}`);
      workout = new Running([lat, lng], distance, duration, cadence);
    }
    //If workout is cycling, create cycling object
    if (type === 'cycling') {
      const elevationGain = +inputElevation.value;
      if (
        //reason for using the or is so that evem if one of them isnt a valid number
        // !Number.isFinite(duration) ||
        // !Number.isFinite(distance) ||
        // !Number.isFinite(elevationGain)
        !validRun(distance, duration, elevationGain) ||
        !allPositive(distance, duration)
      )
        return alert('Wrong input data!');
      workout = new Cycling([lat, lng], distance, duration, elevationGain);
    }
    //add new object to workOut array
    this.#workouts.push(workout);
    console.log(workout);

    this._hideForm();
    this._renderWorkoutMarker(workout);
    this._renderWorkout(workout);
  }
  _renderWorkoutMarker(workout) {
    //L.marker([lat,lng])
    //the lat, lng values has already been entered into the workout object as coords
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? ' 🏃‍♂️' : '🏍'} ${workout.description}`
      )
      .openPopup();
  }
  _renderWorkout(workout) {
    let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === 'running' ? ' 🏃‍♂️' : '🏍'
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>
    `;
    if (workout.type === 'running')
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
            </div>
        </li>
        `;
    if (workout.type === 'cycling')
      html += `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
            </div>
            <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">223</span>
            <span class="workout__unit">m</span>
            </div>
        </li> -->
        `;
    form.insertAdjacentHTML('afterend', html);
  }
  _moveToPopup(e) {
    const workoutEL = e.target.closest('.workout');
    if (!workoutEL) return;
    const workout = this.#workouts.find(
      work => work.id === workoutEL.dataset.id
    );
    console.log(workout);
    //deleting the workout when clicked on
    setTimeout(function () {
      const init = this.#workouts.findIndex(
        work => work.id === workoutEL.dataset.id
      );
      // this.#workouts.bind(this).splice(index, 1);
      console.log(init);
    }, 3000);
    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
    // form.classList.remove('hidden');
  }
}
const app = new App();
// app._getposition();
// //NORMAL WAY OF WRITING THEM WITHOUT THE CLASSES INTRO
// // if (navigator.geolocation)
// //   navigator.geolocation.getCurrentPosition(
// //     function (position) {
// //       const { latitude } = position.coords;
// //       const { longitude } = position.coords;
// //       const coords = [latitude, longitude];
// //       console.log(`https://www.google.com/maps/@latitude,longitude,12z`);
// //       console.log(position);
// //       map = L.map('map').setView([latitude, longitude], 13);
// //       //THE TILE LAYER IS WAH SHOWS THE MAP ON OUR PAGE
// //       L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
// //         attribution:
// //           '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
// //       }).addTo(map);
// //       //THE MARKER IS WHAT GIVE THE LOCATOR POP UP ONCE WE DECLARE THE LATITUDE AND LONGITUDE
// //       L.marker(coords)
// //         .addTo(map)
// //         //THE BELOW BINDPOPUP PROPERTY ISNT
// //         .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
// //         .openPopup();
// //       map.on('click', function (leafE) {
// //         leafEvent = leafE;
// //         console.log(leafEvent);
// //         form.classList.remove('hidden');
// //         inputDistance.focus();
// //         // const { lat, lng } = leafEvent.latlng;
// //         // L.marker([lat, lng])
// //         //   .addTo(map)
// //         //   // .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
// //         //   //THE bindPopup SHII IS USED FOR STYLING THE CSS PROPERTY
// //         //   .bindPopup(
// //         //     L.popup({
// //         //       maxWidth: 250,
// //         //       minWidth: 100,
// //         //       autoClose: false,
// //         //       closeOnClick: false,
// //         //       className: 'running-popup',
// //         //     })
// //         //   )
// //         //   .setPopupContent('Workout')
// //         //   .openPopup();
// //         // // console.log(lat, lng);
// //       });
// //     },
// //     function () {
// //       alert('No co-ordinates info');
// //     }
// //   );
// // // });
// // form.addEventListener('submit', function (e) {
// //   e.preventDefault();
// //   const { lat, lng } = leafEvent.latlng;
// //   L.marker([lat, lng])
// //     .addTo(map)
// //     // .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
// //     //THE bindPopup SHII IS USED FOR STYLING THE CSS PROPERTY
// //     .bindPopup(
// //       L.popup({
// //         maxWidth: 250,
// //         minWidth: 100,
// //         autoClose: false,
// //         closeOnClick: false,
// //         className: 'running-popup',
// //       })
// //     )
// //     .setPopupContent('Workout')
// //     .openPopup();
// // });
// // inputType.addEventListener('change', function () {
// //   inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
// //   inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
// // });
function leapYear(n) {
  if (n % 4 === 0 && n % 100 === 0 && n % 400 === 0) {
    console.log(`Year ${n} is a leap year`);
  } else {
    console.log(`Year ${n} is not a leap year`);
  }
}
leapYear(2000);
function leapYear1(n) {
  n.forEach(function (mov, i, arr) {
    if (mov % 4 === 0) {
      if (mov % 100 === 0) {
        if (mov % 400 === 0) {
          // console.log(`Year ${n} is not a leap year`);
          console.log(i);
          // console.log(`Year ${mov} is a leap year`);
        }
      }
    } else {
      console.log(`Year ${mov} is not a leap year`);
    }
  });
}
leapYear1([2000, 2001, 4000]);
console.log(typeof +'samson');

let g = 45.6;
console.log(Number.isInteger(g));
