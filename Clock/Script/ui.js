// Global Variables
let startingTime = 0,
    time = 0,
    stop = false;

let hour = 0,
    min = 0,
    sec = 0,
    flag = false;

let printMesssageIntervalId,
    timerIntervalId = null,
    intervalId = null;

let checkFlag = false;

class UI {
    constructor() {
        this.prevoiusSaves = this.prevoiusSaves.bind(this);
        this.removeTimezones = this.removeTimezones.bind(this);
        this.addTimezoneToDocument = this.addTimezoneToDocument.bind(this);
        this.timerhandle = this.timerhandle.bind(this);
        this.stopWatchStart = this.stopWatchStart.bind(this);
    }

    // for local time (Indian Standard Time)
    localTime() {
        const indTime = document.getElementById("ind-time");
        const dateTime = new Date();
        indTime.textContent = dateTime.toLocaleTimeString();
        setInterval(this.localTime, 1000);
    }

    // localStorage setter
    localStorageSetter(timezone) {
        if (localStorage.getItem('timezone') === null) {
            localStorage.setItem('timezone', timezone);
        } else {
            let localStorageData = this.localStorageGetter();

            if ((localStorageData.find(function (element) { return element === timezone })) == undefined) {
                localStorageData.push(timezone);
                localStorage.setItem('timezone', localStorageData.toString());
            }
        }
    }

    // localStorage getter
    localStorageGetter() {
        if (localStorage.getItem('timezone') !== null) {
            const localStorageItem = localStorage.getItem('timezone');
            let localStorageItemArray = [];
            localStorageItemArray = localStorageItem.split(',');
            return localStorageItemArray;
        }
    }

    // print any type of error in modal
    printMessage(message) {
        if (document.querySelector('.alert')) return
        const div = document.createElement("div");
        div.className = "alert alert-danger";
        div.textContent = message;
        div.style.marginTop = "10px";

        const msgDiv = document.getElementById("message");
        msgDiv.appendChild(div);

        printMesssageIntervalId = setInterval(() => {
            msgDiv.removeChild(document.querySelector(".alert"));
            console.log("hh");
            clearInterval(printMesssageIntervalId);
        }, 3000);
    }

    // printing any previous saves from localStorage
    async prevoiusSaves() {
        const localStorageData = this.localStorageGetter();

        localStorageData.forEach(async e => {
            const data = await api.firstInitalize(e);
            // updataing document
            const dateTimeString = data.jsonData.datetime;
            let timezone = data.jsonData.timezone;

            // Splitting the date-time string at the "T" character
            let [datePart, timePart] = '';
            if (dateTimeString) {
                [datePart, timePart] = dateTimeString.split("T");

                // Extracting time components
                const [hour, minute] = timePart.split("+")[0].split(":").slice(0, 2); // Extracting only hour and minute

                this.createBlock(timezone, hour, minute);
            }
        })
    }

    // updating all the time that are present in localStorage
    updateSavesTimezones() {
        const boxes = document.querySelectorAll('.box');

        console.log('Update Time');
        boxes.forEach(e => {
            const updateTimezone = e.childNodes[1].childNodes[3].childNodes[3].textContent;
            const updateTime = e.childNodes[3].childNodes[1];

            // current time of that perticular timezone
            const dataFromAPi = api.firstInitalize(updateTimezone);

            dataFromAPi.then(response => {
                const dateTimeString = response.jsonData.datetime;

                // Splitting the date-time string at the "T" character
                const [datePart, timePart] = dateTimeString.split("T");

                // Extracting time components
                const [hour, minute] = timePart.split("+")[0].split(":").slice(0, 2); // Extracting only hour and minute

                updateTime.innerHTML = `${hour}:${minute}<span class="p-3" style="font-size: large;">${hour > 12 ? "pm" : "am"
                    }</span>`
            })
        })
        setInterval(this.updateSavesTimezones, 60000)
    }

    // removeing timezones from localStorage and document
    removeTimezones() {
        let localStorageData = this.localStorageGetter();
        const checks = document.querySelectorAll('.check');
        checks.forEach(e => {
            if (e.checked) {
                const name = e.parentNode.nextSibling.nextSibling.childNodes[3].textContent;
                // getting index of timezone need to remove
                let indexToRemove = localStorageData.indexOf(name);
                if (indexToRemove !== -1) {
                    localStorageData.splice(indexToRemove, 1); // Removes 1 element at the specified index
                    // remove from document

                    document.querySelector('.bottom').removeChild(e.parentNode.parentNode.parentNode);
                }
                // clearing localstorage
                localStorage.clear();
                this.localStorageSetter(localStorageData.toString());
            }
        })
    }

    // shows all area that are under selected continent
    async showAreas(e) {
        // selecting the area where names should be listed
        const areaDropdown = document.querySelector(".area");

        // removeing any previous names
        if (document.querySelector(".dynamic-list")) {
            document.querySelector(".dynamic-list").remove();
        }

        // calling api for areas
        const continentName = e.target.textContent;
        const data = await api.getData(continentName);
        const names = data.jsonData;

        // shows the selected continent from dropdown
        document.getElementById("continent").textContent = continentName;

        // create a div for all dropdown list items
        const div = document.createElement("div");
        div.className = "dynamic-list";

        names.forEach((name) => {
            // removeing the continent name from provided text
            let cityName = name.replace(continentName + "/", "");

            // createing list items
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.className = "dropdown-item";
            a.textContent = cityName;
            li.appendChild(a);
            div.appendChild(li);
        });

        // append the child
        areaDropdown.appendChild(div);
    }

    // shows the name selected from dropdown
    selectedName(e) {
        document.getElementById("area").textContent = e.target.textContent;
    }

    addTimezoneToDocument(e) {
        e.preventDefault();
        // check if user enter the input
        if (document.getElementById("area").textContent.trim() === "Select Area") {
            this.printMessage("Please provide both fields.");
            return;
        }

        const localStorageData = this.localStorageGetter();

        // extracting info from the documnet provided by the user
        const areaName = document.getElementById("area").textContent;
        const continentName = document.getElementById("continent").textContent;

        // calling api
        const time = api.getTime(continentName, areaName);

        // updataing document
        time.then((response) => {
            const dateTimeString = response.jsonData.datetime;
            let timezone = response.jsonData.timezone;

            // if timezone is already exist then do nothing
            if (localStorageData.find(function (element) { return element === timezone })) { return }

            // Splitting the date-time string at the "T" character
            const [datePart, timePart] = dateTimeString.split("T");

            // Extracting time components
            const [hour, minute] = timePart.split("+")[0].split(":").slice(0, 2); // Extracting only hour and minute

            this.createBlock(timezone, hour, minute);
            this.localStorageSetter(timezone);
        });


        // code from chatGPT
        const modal = document.getElementById("add-time-modal");
        modal.classList.remove("show");
        document.body.classList.remove("modal-open"); // Remove modal-open class from body
        const modalBackdrop = document.querySelector(".modal-backdrop");
        if (modalBackdrop) {
            modalBackdrop.classList.remove("modal-backdrop", "show"); // Remove backdrop
        }
    }

    // creating document timezone block
    createBlock(timezone, hour, minute) {
        const div = document.createElement("div");
        div.classList = "h-25 w-100 bg-light mb-3 p-4 box";
        div.innerHTML = `
                <div id="city-name" class="d-flex">
                    <div class="check-box">
                        <input class="form-check-input check" type="checkbox" value="" id="flexCheckIndeterminate">
                    </div>
                    <div>
                        <h6>Timezone</h6>
                        <h1>${timezone}</h1>
                    </div>
                </div>
                <div id="time">
                    <h1>${hour}:${minute}<span class="p-3" style="font-size: large;">${hour > 12 ? "pm" : "am"
            }</span></h1>
                </div>
            `;
        document.querySelector(".bottom").appendChild(div);
    }

    // showing all checkbox on timezone block
    selectButoon() {
        const checkBoxes = document.querySelectorAll('#flexCheckIndeterminate');
        if (checkFlag === false) {
            checkBoxes.forEach(e => {
                e.style.display = 'block';
                checkFlag = true;
            })
            document.getElementById('remove').style.display = 'block'
        } else {
            checkBoxes.forEach(e => {
                e.style.display = 'none';
                checkFlag = false;
            })
            document.getElementById('remove').style.display = 'none'
        }
    }

    // stopwatch methods start here
    stopWatchStart() {
        flag = false;
        this.timeCycle();
    }

    stopWatchStop() {
        flag = true;
    }

    timeCycle() {
        if (min === 60) {
            hour++;
            min = 0;
        }
        if (sec === 60) {
            min++;
            sec = 0;
        } else {
            sec++;
        }
        let docMin, docSec, docHour;

        docHour = hour < 10 ? "0" + hour : hour;
        docMin = min < 10 ? "0" + min : min;
        docSec = sec < 10 ? "0" + sec : sec;

        // update document
        document.getElementById("hour").innerHTML = docHour;
        document.getElementById("min").innerHTML = docMin;
        document.getElementById("sec").innerHTML = docSec;

        if (flag === false && intervalId === null) {
            // Check if flag is false and intervalId is null
            intervalId = setInterval(this.timeCycle, 1000); // Start the interval
            console.log("Interval started");
        } else if (flag === true && intervalId !== null) {
            // Check if flag is true and intervalId is not null
            clearInterval(intervalId); // Stop the interval
            intervalId = null; // Reset intervalId
            console.log("Interval stopped");
        }
    }

    // timer methods start here
    timerhandle(e) {
        e.preventDefault();

        const coundownBox = document.querySelectorAll('.box');
        coundownBox.forEach(e => {
            e.style.color = 'black'
        })
        // retreving the time value from modal
        startingTime = Number(document.getElementById("time").value);
        time = startingTime * 60;
        if (startingTime === 0 || isNaN(startingTime)) {
            this.printMessage("Please provide an valid time like 1 min or 5 min");
        } else {
            // remove modal after pushing start button
            const modal = document.getElementById("add-time-modal");
            modal.classList.remove("show"); // Hide the modal
            document.body.classList.remove("modal-open"); // Remove modal-open class from body
            const modalBackdrop = document.querySelector(".modal-backdrop");
            if (modalBackdrop) {
                modalBackdrop.classList.remove("modal-backdrop", "show"); // Remove backdrop
            }
            this.countDown();
        }
    }

    // countDown for timer
    countDown() {
        if (time === -1) {
            document.getElementById("myAudio").play();
        }
        if (time < 10) {
            const coundownBox = document.querySelectorAll('.box');
            coundownBox.forEach(e => {
                e.style.color = 'red'
            })
        }
        if (time >= 0 && stop === false) {
            let min = Math.floor(time / 60);
            let sec = time % 60;

            min = min < 10 ? "0" + min : min;
            sec = sec < 10 ? "0" + sec : sec;

            document.getElementById("min").textContent = min;
            document.getElementById("sec").textContent = sec;

            time--;

            if (stop === false && timerIntervalId === null) {
                timerIntervalId = setInterval(this.countDown, 1000);
                console.log("Interval Started");
            } else if (stop === true && timerIntervalId !== null) {
                clearInterval(timerIntervalId);
                timerIntervalId = null;
                console.log("Interval Stop");
            }
        }
    }

    // stop timer
    timerStop() {
        document.getElementById("myAudio").pause();
        clearInterval(timerIntervalId);
        timerIntervalId = null;
        console.log("Interval Stop");
    }

    // reseting timer
    reset() {
        location.reload();
    }
}
