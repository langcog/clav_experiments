//Title: CLAV iPAD STUDY FOR BING NURSERY SCHOOL SPRING 2014
//Author: Nick Moores, Stanford University LangCog Lab + Phonetics Lab
//Many thanks to those who helped with the iPad code and with experiment design, including Kevin McGowan, Meghan Sumner, Elise Sugarman, Molly Lewis, Ann Nordmeyer, and Michael Frank

//Updated as of 4/28/2014

/*---------------INTRODUCTION-------------------*/
/* Experiment Notes!
See NPM/CLAV_iPad in Fetch's expts folder for the actual experiment.
Results posted into: CLAV_iPad_Exp1results.csv
Raw data for NPM_CLAV resides in cgi-bin/NPM_CLAV on Fetch and is a direct result of the javascript's interaction 
with the php script in NPM/CLAV_iPad/Experiment1 (that's where the javascript is).
Every time the study is completed, one row for each trial is added to the csv file...

The columns of the results .csv are:
    subjectID: inputed at time of study; format is [date] [hyphen] [the number ran that day] 
    list_number: the list chosen for these trials
    tar_name: the name of the object in question
    voice_type: whether the voice belongs to a man, woman, or girl
    comp_type: whether the competitor is a man, woman, or girl
    has_comp: true if critical trial, false if control trial
    upper_left: the image displayed in the upper left corner
    upper_right: the image displayed in the upper right corner
    lower_left: the image displayed in the lower left corner
    lower_right: the image displayed in the lower right corner
    clicked: which image the child clicked (by position on the screen)
    correct: the CSS id corresponding to the location of the correct choice (for easy comparison when coding)
    RT: the time, in milliseconds, it took for the child to click after the images displayed (NEED TO UPDATE)
    age: the age of the child, formatted year;months
    gender: male or female (biological sex)
    day: the day the experiment took place
    time: the time of day the experiment began

  about to call playSentenceSound
  loading the wav file
  playing the wav file
  I think the wav file has played  
  */

    /*---------------- PARAMETERS (global vars... sorry Mehran)------*/

var numTrials = 12; //governs the number of trials in the experiment
var listID = 0; //governs which condition a given child will be in
var subjectID;
var age_entry;
var gender_entry;
var pauseTime = 0; //governs the animation look
var password = "Clav"; //the password to use for the study
var conditions = [1,2,3,4,5,6,7,8,9,10,11,12];
var start; //starting time in milliseconds for a given trial
var finish; //finishing time in milliseconds for a given trial
var diff; //difference between start and finishing time for a given trial
var intro = "'s voice says: Look at my ";
var experiment_result_array = []; //initializes result array
var result_headers = ["subjectID","list_number","tar_name","voice_type","comp_type","has_comp","upper_left","upper_right","lower_left","lower_right","clicked","correct","RT", "age", "gender", "day","time"];
experiment_result_array[0] = result_headers; //puts in headers for result file
/*---------------- HELPER FUNCTIONS------------------*/

// show slide function
function showSlide(id) {
  $(".slide").hide(); //jquery - all elements with class of slide - hide
  $("#"+id).show(); //jquery - element with given id - show
  return;
}

//array shuffle function
shuffle = function (o) { //v1.0, takes in an array of items
    for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
}

/*Function: getCurrentDate
  Usage: var date = getCurrentDate();
  Params: none
  Returns: string representing date
  Gets date for timestamp*/
  getCurrentDate = function() {
    var currentDate = new Date();
    var day = currentDate.getDate();
    var month = currentDate.getMonth() + 1;
    var year = currentDate.getFullYear();
    return (month + "/" + day + "/" + year);
  }

/*Function: getCurrentTime
  Usage: var time = getCurrentTime();
  Params: none
  Returns: string representing time
  Gets date for timestamp*/
  getCurrentTime = function() {
    var currentTime = new Date();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();

    if (minutes < 10) minutes = "0" + minutes;
    return (hours + ":" + minutes);
  }

/*Function: createDot
  Usage: createDot(dotx, doty, i)
  Params: dotx, the x-coordinate; doty, the y-coordinate; i, index of an iteration
  Returns: nothing
  creates the dots we will use in the training stage of the experiment*/
  function createDot(dotx, doty, i) {
    var dots = [1, 2, 3, 4, 5];

    var dot = document.createElement("img");
    dot.setAttribute("class", "dot");
    dot.id = "dot_" + dots[i];
    dot.src = "dots/dot_" + dots[i] + ".jpg";

    var x = Math.floor(Math.random()*950);
    var y = Math.floor(Math.random()*550);

    var invalid = "true";
    //make sure dots do not overlap
    while (true) {
        invalid = "true";
        for (j = 0; j < dotx.length ; j++) {
            if (Math.abs(dotx[j] - x) + Math.abs(doty[j] - y) < 200) {
                var invalid = "false";
                break; 
            }
        }
        if (invalid === "true") {
            dotx.push(x);
            doty.push(y);
            break;  
        }
        x = Math.floor(Math.random()*400);
        y = Math.floor(Math.random()*400);
    }
    dot.setAttribute("style","position:absolute;left:"+x+"px;top:"+y+"px;");
    training.appendChild(dot);
    return;
}

/*Function: getRandomInt
  Usage: ID = getRandomInt();
  Params: none
  Returns a value between a and b (typically 1 and 4) representing
  which trial type will be experienced
  Called when determining which version of the experiment to
  display
  */
  function getRandomInt(min,max) {
    var ID = Math.floor(Math.random()*(max - min + 1) + min); //returns tag corresponding to one of our lists/conditions
    return ID
}

/*Function: adminCheck
  Usage: adminCheck()
  Params: none
  Returns: a bool of whether the credentials are good
  Ensures password and subjectID are valid
  */
  function adminCheck() {
    subjectID = document.getElementById("subjectID").value; //retrieves the subject ID already input
    /****Checks password field****/
    if (document.getElementById("pswd").value !== password) { //if the password is incorrect
        $("#checkMessage").html('<font color="red">Wrong Password</font>'); //adds a warning!
        return false;
    }
    /****Checks subjectID field****/
    if (document.getElementById("subjectID").value.length < 1) { //if the subjectID is the empty string
        $("#checkMessage").html('<font color="red">You must input a subject ID</font>'); //adds a warning!
        return false;
    }
    /****Checks list ID field****/
    if (document.getElementById("list_number").value === null) {
        return false;
    }
    return true;
}

/*Function: getTrialType
  Usage: getTrialType()
  Params: none
  Returns: condArray, which experiment we're going to use
  */
  function getTrialType () {
    var list_number = document.getElementById("list_number").value; //retrieves the list number already input
    listID = list_number; //assigns this to global var to go in result array
    console.log("list number is " + list_number); //prints for debugging
    return getWordList(list_number); //constructs the experiment, choosing a random iteration from the desired list
}

/*Function: getWordList
  Usage: getWordList()
  Params: list_number, the csv file chosen
  Returns: the csv data
  */
  function getWordList(list_number) {
    var filename = "clav_ipad_list_" + list_number + ".csv";
    console.log("filename is "+filename);
    var capsule = [];
    $.ajaxSetup({async: false}); //allows php to execute fully before returning to javascript to update condArray
    var php_url = "http://langcog.stanford.edu/cgi-bin/NPM_CLAV/clav_filereading.php";
    var php_request = "?w1=" + filename;
    var total_request = php_url + php_request;
    $.get(total_request, function(data) {
        capsule = data;
    },"json");
    return capsule;
}

/*Function: preloading
  Usage: preloading()
  Params: nothing
  Returns: nothing*/
  preloading = function() {
    var image_array = new Array();
    for (var i = 0; i < preloading.arguments.length; i++) {
        image_array[i] = new Image();
        image_array[i].src = preloading.arguments[i];
    }
  }

/*Function: loadAllImages
  Usage: loadAllImages(data)
  Params: data, the multidimensional array from which to load pictures
  Returns: nothing*/
  loadAllImages = function(data) {
    for (var j = 1; j < conditions.length; j++) { //iterates through rows of experiment list (but NOT the header)
        var holder = data[0][j]; //goes to the next row of experiment list
        var imgArray = holder.split(","); //makes this into an array
        for (var i = 0; i < imgArray.length; i++) { //iterates through that array
            imgArray[i] = imgArray[i].replace(/"/g, ""); //removes erroneous quote marks
            imgArray[i] = imgArray[i].replace(/\r/g, ""); //removes erroneous carriage returns (dammit excel)
            var html_image = 'images/'; //prepend to filepath
        }
        var linkName_ul = html_image + imgArray[6]; //gets source path for upperleft image
        var linkName_ur = html_image + imgArray[7]; //gets source path for upperright image
        var linkName_ll = html_image + imgArray[8]; //gets source path for lowerleft image
        var linkName_lr = html_image + imgArray[9]; //gets source path for lowerright image
        preloading(linkName_ul, linkName_ur, linkName_ll, linkName_lr); //preloads these images
    }
    return;
}

/*Function: createCondition
  Usage: createCondition(data)
  Params: data, the multidimensional array containing condition info
  trial_num, the value from the conditions array that has been randomly selected as next
  retrieved from the .csv
  Returns: condArray, the array governing the info for this trial
  */
  function createCondition(data, trial_num) {
    console.log(data);
    var holder = data[0][trial_num];
    var condArray = holder.split(","); //[0][0] gives you the header row
    for (var i = 0; i < condArray.length; i++) {
        condArray[i] = condArray[i].replace(/"/g, "");
        condArray[i] = condArray[i].replace(/\r/g, "");
    }
    console.log(condArray);
    return condArray;
}

/*Function: submitData
  Usage: submitData()
  Params: none
  Returns: none
  Submits post request to results php script and ends the experiment
  */
  function submitData() {
    $.post("http://langcog.stanford.edu/cgi-bin/NPM_CLAV/clav_ipad_1_submit.php", {postresult_array : experiment_result_array}); //posts the results to the server using php
    $("#stage").fadeOut(); //fades out the stage slide
    experiment.end(); //calls the experiment's end function
    return;
}

/*Function: makeImageTable
  Usage: makeImageTable(condArray)
  Params: condArray, array containing info governing the current trial
  Returns: none
  Displays the images in dynamically created html according to specs from the condArray
  */
  function makeImageTable(condArray) {
    // Create the object table (tr=table row; td= table data)
    objects_html = '<table class = "centered" ><tr><td id=word colspan="2"></td></tr>';; //starts off the html block    
    //HTML for the object on the upper-left
    upperLeftName = 'images/' + condArray[6]; //gives name of dynamic left object, pulls from storage
    objects_html += '<tr><td align="center"><img class="pic" src="' + upperLeftName +  '"alt="' + upperLeftName + '" id= "upperLeftPic"/></td>'; //creates html for the object
    //HTML for the object on the upper-right
    upperRightName = 'images/' + condArray[7]; //gives name of dynamic right object, pulls from storage
    objects_html += '<td align="center"><img class="pic" src="' + upperRightName +  '"alt="' + upperRightName + '" id= "upperRightPic"/></td></tr>'; //creates html for the object
    //HTML for the object on the lower-left
    lowerLeftName = 'images/' + condArray[8]; //gives name of dynamic left object, pulls from storage
    objects_html += '<tr><td align="center"><img class="pic" src="' + lowerLeftName +  '"alt="' + lowerLeftName + '" id= "lowerLeftPic"/></td>'; //creates html for the object
    //HTML for the object on the lower-right
    lowerRightName = 'images/' + condArray[9]; //gives name of dynamic right object, pulls from storage
    objects_html += '<td align="center"><img class="pic" src="' + lowerRightName +  '"alt="' + lowerRightName + '" id= "lowerRightPic"/></td>'; //creates html for the object   
    objects_html += '</tr></table>'; //finishes the html block
    $("#objects").html(objects_html); //converts the block to actual html
    return;
}

/*Function: redrawTable
  Usage: redrawTable(condArray)
  Params: condArray, array containing info governing the current trial
  Returns: none
  Displays the next images in dynamically created html according to specs from the condArray
  */
  function redrawTable(condArray) {
    var upperLeft = 'images/' + condArray[6];
    document.getElementById("upperLeftPic").src = upperLeft; //gets the next upper-left picture
    var upperRight = 'images/' + condArray[7];
    document.getElementById("upperRightPic").src = upperRight; //gets the next upper-right picture
    var lowerLeft = 'images/' + condArray[8];
    document.getElementById("lowerLeftPic").src = lowerLeft; //gets the next lower-left picture
    var lowerRight = 'images/' + condArray[9];
    document.getElementById("lowerRightPic").src = lowerRight; //gets the next lower-right picture
    return;
}

/*Function: playSentenceSound
  Usage: playSentenceSound(condArray)
  Params: condArray, array containing info governing the current trial
  Returns: none
  Loads and plays the sound file for the given trial, and starts the timer*/
function playSentenceSound(condArray) {
    var clipPath = "AudioClips/" + condArray[1];
    $("#sound_player")[0].src = clipPath;
    setTimeout(function(){
        var before_play = new Date();
      console.log("about to play sound file: " + before_play + " " + before_play.getMilliseconds());
      $("#sound_player")[0].play();
        console.log("Playing " + condArray[1] + " " + new Date().getMilliseconds());
        start = new Date(); //gets the most update time in ms from when the sound clip starts playing
        console.log("start!: " + start + " " + start.getMilliseconds());    
        },pauseTime);
    return;
}

/*Function: ringChimes
  Usage: ringChimes()
  Params: none
  Returns: none
  Loads and plays the chimes sound, which will act as a marker of response to user*/
function ringChimes() {
    var clipPath = "AudioClips/chimes.wav";
    $("#sound_player")[0].src = clipPath;
    $("#sound_player")[0].play();
    console.log("Playing chimes");
    return;
}

/****************MAIN EXPERIMENT FUNCTION**********************/
/*Note that the entire experiment is contained within the 'experiment'
  variable. There are objects, attributes and functions within the experiment
  function that govern its states and behavior. Think OOP!

  Experiment broken into:
  -training: creates and runs the dot game
  -init: checks for valid credentials, gets csv_data from php as 'data', shuffles trial order
  -run: for each trial, gets the next row from the shuffled csv data and implements accordingly, saving results along the way
  -end: displays closing information
  */

showSlide("instructions"); //shows the instructions slide and is ready to start the experiment
$("#pleaseWait").html("Please wait while the experiment loads...")
$(window).load(function() {
    $("#startButton").button('enable');
    $("#pleaseWait").html("")  
})

var experiment = { //var containing the experiment, though everything is called from within it
    /*  Function: training
        Usage: experiment.training()
        Params: none
        Returns: none
        Will call the createDot(x,y,i) function, calls experiment.next()
        */
    training : function() {
        var xcounter = 0;
        var dotCount = 5; //determines how many dots you have on training task; keep at 5 or fewer
        var dotx = [];
        var doty = [];
        for (i = 0; i < dotCount; i++) {
            createDot(dotx, doty, i); //creates each dot with its given coordinates
        }
        showSlide("training");
        $('.dot').bind('click', function(event) {
            var dotID = $(event.currentTarget).attr('id');
            document.getElementById(dotID).src = "dots/x.jpg";
            xcounter++
            if (xcounter === dotCount) {
                setTimeout(function () {
                    $("#training").hide();
                    showSlide("start");
                }, pauseTime);
            }
        });    
    }, //finishes declaration of training method

    /*
      Function: init
      Usage: experiment.init()
      Params: none
      Returns: none
      Called after training when a trial is about to begin during timeout.
      Decides which list condition to use.*/
    init : function() { //governs which rubric to follow (voice, trial type, etc)
        if (adminCheck()) { //makes sure password and subject id are ok
            $("#pleaseWait").html("Please wait while the experiment loads...")
            var data = getTrialType(); //sets up which experiment we use; calls getWordList
            loadAllImages(data); //preloads everything we'll need so there's no image lag
            conditions = shuffle(conditions); //randomizes order of the trials
            $("#pleaseWait").html("")
            var clipPath = "AudioClips/chimes.wav";
            $("#sound_player")[0].src = clipPath;
            $("#sound_player")[0].play();
            $("#start").hide();
            setTimeout(function(){
                experiment.run(data);
            },pauseTime);
        } else { //password is incorrect or subjectID or ListID not given
            experiment.end(); //ends the experiment without collecting data
        }
    }, //finishes declaration of init method

    /*Function: run
      Usage: experiment.run()
      Params: none
      Returns none
      Called when need to get a new trial; first called from experiment.training        
      First called after training, calls itself until counter === numTrials var set at beginning*/
    run : function(data) { //Will be the main display function
        document.body.style.background = "white"; //makes a white screen for run of experiment; change background color here
        var trial_result_array = []; //initializes result_string variable that will hold the result of each trial, to be parsed later
        var subjID = 0;
        var listnum = 1;
        var tar_name = 2;
        var voice_type = 3;
        var comp_type = 4;
        var has_comp = 5;
        var upper_left = 6;
        var upper_right = 7;
        var lower_left = 8;
        var lower_right = 9;
        var clicked = 10;
        var correct = 11;
        var RT = 12;
        var age = 13;
        var gender = 14;
        var day = 15;
        var time = 16;
        var label_html = ""; //initializes label_html variable to 
        var objects_html = ""; //initializes objects_html variable to
        var i = 0; //initializes counter variable
        var condArray = []; //will hold condition information
        var trial = conditions[i]; //gets trial index from shuffled conditions array
        var condArray = createCondition(data, trial); //gets the values for the current trial
        makeImageTable(condArray); //puts the images on the screen
        $("#stage").fadeIn("slow");
        playSentenceSound(condArray); //plays the audio associated with this trial  
        /****THIS GOVERNS WHAT HAPPENS WHEN SOMETHING IS CLICKED!!!************/
        $('.pic').bind('click', function(event) {
            end = new Date(); //gets the most updated time in ms
            console.log("end!: " + end + " " + end.getMilliseconds());
            diff = end - start; //gets reaction time
            console.log("diff is " + diff);
            var picID = $(event.currentTarget).attr('id'); //assigns what is currently being clicked to variable of picID
            i++; //increments the counter (only way the experiment advances, can only happen when user clicks a picture)
            trial_result_array[subjID] = subjectID;
            trial_result_array[listnum] = listID;
            trial_result_array[tar_name] = condArray[3];
            trial_result_array[voice_type] = condArray[2];
            trial_result_array[comp_type] = condArray[4];
            trial_result_array[has_comp] = condArray[5];
            trial_result_array[upper_left] = condArray[6];
            trial_result_array[upper_right] = condArray[7];
            trial_result_array[lower_left] = condArray[8];
            trial_result_array[lower_right] = condArray[9];
            trial_result_array[clicked] = picID;
            trial_result_array[correct] = condArray[10];
            trial_result_array[RT] = diff;
            trial_result_array[age] = age_entry;
            trial_result_array[gender] = gender_entry;
            trial_result_array[day] = getCurrentDate();
            trial_result_array[time] = getCurrentTime();
            experiment_result_array[i] = trial_result_array; //adds this trial's results to the overall result array
            trial_result_array = []; //resets the trial array holder
            /***If experiment complete, submit data to server***/
            if (i === numTrials) { //checks for experiment completion
                submitData(); //posts using php to server, ends experiment
            } else {
                /****All the data for that trial has been recorded, so proceed to next one****/
                //ringChimes(); //
                $("#stage").fadeOut("slow"); //fades out the last pictures
                    trial = conditions[i];
                    condArray = createCondition(data, trial);
                    setTimeout(function() { //gets the next set of stimuli
                    redrawTable(condArray);
                    $("#stage").fadeIn("slow"); //displays the new stimuli on the screen
          var sound_call = new Date();
          console.log("about to call playSentence Sound: "+ sound_call + " " + sound_call.getMilliseconds());
                    playSentenceSound(condArray); //plays the next audio clip and starts the timer
                }, pauseTime);
            }   
        });
    }, //finishes declaration of run method

    /*Function: end
      Usage: experiment.end()
      Params: none
      Returns: none
      called when the number of trials is up; everything's over */
    end : function() { //governs how the experiment will end
        showSlide("finish"); //shows the 'finish' slide from the html file
        document.body.style.background = "black"; //makes a black screen
        console.log(experiment_result_array);
    }, //finishes declaration of end method
}
