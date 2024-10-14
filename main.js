let scoreboard = [[]];
let ball_no = 0;
let over_no = 0;
let runs = 0;
let wickets = 0;
let edited = [];
let isNoBall = false;
let isFreeHit = false;
let ballHistory = [];

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
    $("#run_no_ball").on("click", handleNoBall);
    $("#run_W").on("click", () => playBall("W", 0));
    $("#scoreboard-btn").on("click", updateScoreboard);
    $("#undo-btn").on("click", undoLastAction);
    $(".noBallRun").on("click", handleNoBallRuns);
}

function handleNoBall() {
    toggleNoBall(true);
    $('#noBallModal').modal('show');
}

function handleNoBallRuns() {
    let runsScored = parseInt($(this).data('runs'));
    playBall(`Nb${runsScored}`, runsScored);
    $('#noBallModal').modal('hide');
}

function playBall(run, score = 0) {
    let previousState = {
        runs: runs,
        wickets: wickets,
        over_no: over_no,
        ball_no: ball_no,
        isNoBall: isNoBall,
        isFreeHit: isFreeHit,
        lastBall: scoreboard[over_no].length > 0 ? scoreboard[over_no][scoreboard[over_no].length - 1] : null
    };

    if (run === "Wd") {
        runs += score;
        scoreboard[over_no].push(run);
        addBallButton(run);
    } else if (run.startsWith("Nb")) {
        runs += score + 1; // Add runs scored on the no-ball plus 1 for the no-ball itself
        scoreboard[over_no].push(run);
        addBallButton(run);
        toggleNoBall(false);
        toggleFreeHit(true);
    } else if (isFreeHit) {
        runs += score;
        let freeHitDisplay = `${run}`;
        scoreboard[over_no].push(freeHitDisplay);
        addBallButton(freeHitDisplay);
        toggleFreeHit(false);
        incrementBallCount();
    } else {
        runs += score;
        scoreboard[over_no].push(run);
        addBallButton(run);
        
        if (run === "W") {
            wickets++;
        }
        
        incrementBallCount();
    }
    
    ballHistory.push(previousState);
    
    updateScore();
    updateRunboard();
    updateScoreboard();
}

function toggleNoBall(isActive) {
    isNoBall = isActive;
    $("#run_no_ball").toggleClass("active", isActive);
    $("#run_wide, #run_W").prop("disabled", isActive);
    if (isActive) {
        $("#run_wide, #run_W").addClass("disabled");
    } else {
        $("#run_wide, #run_W").removeClass("disabled");
    }
}

function toggleFreeHit(isActive) {
    isFreeHit = isActive;
    $("#run_W").prop("disabled", isActive);
    if (isActive) {
        $("#run_W").addClass("disabled");
    } else {
        $("#run_W").removeClass("disabled");
    }
}

function incrementBallCount() {
    ball_no++;
    if (ball_no >= 6) {
        ball_no = 0;
        over_no++;
        scoreboard.push([]);
    }
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
    if (run.startsWith("Wd")) btnClass += " btn ball-btn";
    else if (run.startsWith("Nb")) btnClass += " ball-btn-noball";
    else if (run === "W") btnClass += " ball-btn-wicket";
    else if (run === "4") btnClass += " ball-btn-four";
    else if (run === "6") btnClass += " ball-btn-six";
    else btnClass += " btn-outline-primary";
    
    let btn = $(`<button class="${btnClass}">${run}</button>`);
    $("#ball-container").append(btn);
}

function updateScoreboard() {
    let table = "<tr><th>Over</th><th>Ball-by-Ball</th><th>Runs</th><th>Extras</th></tr>";
    scoreboard.forEach((over, index) => {
        let overRuns = over.reduce((sum, run) => {
            if (run.startsWith("Nb") || run.startsWith("F+")) {
                return sum + (parseInt(run.split("+")[1]) || 1);
            } else if (run !== "W" && run !== "Wd") {
                return sum + (parseInt(run) || 0);
            }
            return sum;
        }, 0);
        let extras = over.filter(run => run.startsWith("Wd") || run.startsWith("Nb")).length;
        let ballByBall = over.join(", ");
        table += `<tr><td>${index + 1}</td><td>${ballByBall}</td><td>${overRuns}</td><td>${extras}</td></tr>`;
    });
    $("#scoreboard").html(table);
}

function undoLastAction() {
    if (ballHistory.length === 0) return;
    
    let previousState = ballHistory.pop();
    
    runs = previousState.runs;
    wickets = previousState.wickets;
    over_no = previousState.over_no;
    ball_no = previousState.ball_no;
    isNoBall = previousState.isNoBall;
    isFreeHit = previousState.isFreeHit;
  
    // Update the scoreboard by removing the last ball in the over
    if (previousState.lastBall === null) {
      scoreboard[over_no] = [];
    } else {
      scoreboard[over_no].pop();
    }
  
    // Handle toggling no-ball and free-hit states
    if (previousState.lastBall && previousState.lastBall.startsWith("Nb")) {
      toggleNoBall(false); // Explicitly reset no-ball state
    } else {
      toggleNoBall(isNoBall); 
    }
    toggleFreeHit(isFreeHit);

    // Re-enable the wide button when undoing any ball
    $("#run_wide").prop("disabled", false);
    $("#run_wide").removeClass("disabled");
  
    // Update the score, runboard, and scoreboard to reflect the undone action
    updateScore();
    updateRunboard();
    updateScoreboard();
  }