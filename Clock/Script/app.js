const api = new API(),
    ui = new UI();

document.addEventListener("DOMContentLoaded", initalizeElements);

function initalizeElements() {
    // world clock events handle
    if (document.getElementById("worldClock")) {
        ui.localTime();
        ui.prevoiusSaves();
        ui.updateSavesTimezones()
        
        const continent = document.querySelectorAll(".continent .dropdown-item");
        continent.forEach((e) => {
            e.addEventListener("click", ui.showAreas);
        });
        document.querySelector(".area").addEventListener("click", ui.selectedName);
        document.getElementById("addTime").addEventListener("submit", ui.addTimezoneToDocument);
        document.getElementById("select").addEventListener('click',ui.selectButoon);
        document.getElementById('remove').addEventListener('click',ui.removeTimezones);
    }

    // stopWacth events handle
    if (document.getElementById("stopwatch")) {
        document
            .getElementById("start")
            .addEventListener("click", ui.stopWatchStart);
        document.getElementById("stop").addEventListener("click", ui.stopWatchStop);
        document.getElementById("reset").addEventListener("click", ui.reset);
    }

    // timer event handle
    if (document.getElementById("timer")) {
        // for hidding audio controls
        document.getElementById("myAudio").controls = false;

        document
            .getElementById("addTime")
            .addEventListener("submit", ui.timerhandle);
        document.querySelector("#stop").addEventListener("click", ui.timerStop);
        document.querySelector("#reset").addEventListener("click", ui.reset);
    }
}
