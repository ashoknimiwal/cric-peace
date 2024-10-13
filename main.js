let scoreboard = [[]];
let ball_no = 0;
let over_no = 0;
let runs = 0;
let wickets = 0;
let edited = [];
let isNoBall = false;

$(document).ready(function () {
    attachEventListeners();
    updateScore();
    updateRunboard();
});

function attachEventListeners() {
    $("#run_dot").on("click", () => playBall("0", 0));
    $("#run_1").on("click", () => playBall("1", 1));
    $("#run_2").on("click", () => playBall("2", 2));
    $("#run_3").on("click", () => playBall("3", 3));
    $("#run_4").on("click", () => playBall("4", 4));
    $("#run_6").on("click", () => playBall("6", 6));
    $("#run_wide").on("click", () => playBall("Wd", 1));
    $("#run_no_ball").on("click", () => playBall("Nb", 1));
    $("#run_W").on("click", () => playBall("W", 0));
    $("#scoreboard-btn").on("click", updateScoreboard);
    $("#undo-btn").on("click", undoLastAction);
}

function playBall(run, score = 0) {
    if (run === "Wd" || run === "Nb") {
        runs += score;
        scoreboard[over_no].push(run);
        if (run === "Nb") toggleNoBall(true);
        addBallButton(run);
    } else {
        if (isNoBall) {
            scoreboard[over_no].push(run);
            toggleNoBall(false);
        } else {
            scoreboard[over_no].push(run);
            if (run === "W") wickets++;
            else runs += score;
            
            ball_no++;
            if (ball_no >= 6) {
                ball_no = 0;
                over_no++;
                scoreboard.push([]);
            }
        }
        addBallButton(run);
    }
    
    updateScore();
    updateRunboard();
    updateScoreboard();
}

function toggleNoBall(isActive) {
    isNoBall = isActive;
    $("#run_no_ball").toggleClass("active", isActive);
    $("#run_wide, #run_W").prop("disabled", isActive);
}

function updateScore() {
    $("#run").text(runs);
    $("#wickets").text(wickets);
    $("#over-ball").text(`${over_no}.${ball_no}`);
}

function updateRunboard() {
    $("#ball-container").empty();
    scoreboard.forEach((over, overIndex) => {
        over.forEach((ball, ballIndex) => {
            addBallButton(ball, overIndex, ballIndex);
        });
    });
}

function addBallButton(run, overIndex, ballIndex) {
    let btnClass = "btn btn-outline-primary ball-btn";
    if (run === "Wd" || run === "Nb") btnClass = "btn btn-warning ball-btn";
    if (run === "W") btnClass = "btn btn-danger ball-btn";
    
    let btn = $(`<button class="${btnClass}">${run}</button>`);
    $("#ball-container").append(btn);
}

function updateScoreboard() {
    let table = "<tr><th>Over</th><th>Ball-by-Ball</th><th>Runs</th><th>Extras</th></tr>";
    scoreboard.forEach((over, index) => {
        let overRuns = over.reduce((sum, run) => sum + (run !== "W" && run !== "Wd" && run !== "Nb" ? parseInt(run) || 0 : 0), 0);
        let extras = over.filter(run => run === "Wd" || run === "Nb").length;
        let ballByBall = over.join(", ");
        table += `<tr><td>${index + 1}</td><td>${ballByBall}</td><td>${overRuns}</td><td>${extras}</td></tr>`;
    });
    $("#scoreboard").html(table);
}

function undoLastAction() {
    if (over_no === 0 && scoreboard[0].length === 0) return;
    
    let lastOver = scoreboard[over_no];
    if (lastOver.length === 0) {
        over_no--;
        lastOver = scoreboard[over_no];
        ball_no = lastOver.length - 1;
    } else {
        ball_no--;
    }
    
    let lastAction = lastOver.pop();
    if (lastAction === "W") wickets--;
    else if (lastAction !== "Wd" && lastAction !== "Nb") runs -= parseInt(lastAction) || 0;
    
    if (ball_no < 0) {
        ball_no = 5;
        over_no--;
    }
    
    updateScore();
    updateRunboard();
    updateScoreboard();
}