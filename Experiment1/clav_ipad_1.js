//Title: CLAV iPAD STUDY FOR BING NURSERY SCHOOL SPRING AND SUMMER 2014
//Author: Nick Moores, Stanford University LangCog Lab + Phonetics Lab
//Many thanks to those who helped with the iPad code and with experiment design, including Kevin McGowan, Meghan Sumner, Ann Nordmeyer, Elise Sugarman, Molly Lewis, and Michael Frank

//Updated as of 7/6/2014

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
  AudioPlayedTime: time wav played in seconds (relative to start of experiment)
  TapTime: time user tapped (again, relative to experiment)
  RT: the time, in milliseconds, it took for the child to click after the images displayed (NEED TO UPDATE)
  age: the age of the child, formatted year;months
  gender: male or female (biological sex)
  day: the day the experiment took place
  time: the time of day the experiment began
  */

  /*---------------- PARAMETERS (global vars... sorry Mehran)------*/

var numTrials = 12; //governs the number of trials in the experiment
var class_counter = 0;
var pic_counter = ".pic0";
var listID = 0; //governs which condition a given child will be in
var subjectID;
var practiceBlock;
var block1;
var block2;
var pauseTime = 1250; //governs the animation look
var password = "Clav"; //the password to use for the study
var audioDir = "AudioClips/";
var conditions = [0,1,2,3,4,5,6,7,8,9,10,11];
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
var AudioPlayedTime = 12;
var TapTime = 13;
var RT = 14;
var inits_html = ""; //initializes label_html variable to 
var objects1_html = ""; //initializes objects_html variable to
var objects2_html = ""; //initializes objects_html variable to
var condArray = [];
var trial;
var start; //starting time in milliseconds for a given trial
var finish; //finishing time in milliseconds for a given trial
var diff; //difference between start and finishing time for a given trial
var trial_result_array = []; //initializes result_string variable that will hold the result of each trial, to be parsed later
var experiment_result_array = []; //initializes result array
var result_headers = ["subjectID","list_number","tar_name","voice_type","comp_type","has_comp","upper_left","upper_right","lower_left","lower_right","clicked","correct","AudioPlayedTime","TapTime","RT"];
experiment_result_array[0] = result_headers; //puts in headers for result file

/* create audio context for experiment: times will be relative to this */
var AudioContext = AudioContext || webkitAudioContext;
var aC;
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
    //console.log("filename is "+filename);
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
    return;
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
/*Function: makeBlock
  Usage: makeBlock(data,index)
  Params: data, the multidimensional array containing condition info
  index, the value of the array you'd like to start at
  Returns: a block of data, either block1 or block2
*/
function makeBlock(data, index) {
    var block = [];
    for (var i = 0; i < numTrials; i++) {
        var holder = [];
        holder = data[0][index + i];
        block[i] = holder.split(",");
    }
    return block;
}
/*Function: createCondition
  Usage: createCondition(data)
  Params: data, the multidimensional array containing condition info
  trial_num, the value from the conditions array that has been randomly selected as next
  retrieved from the .csv
  Returns: condArray, the array governing the info for this trial
  */
function createCondition(data, trial_num) {
    condArray = data[trial_num];
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
    var outfile = "CLAV_iPad_" + subjectID + "_Exp1results.csv";
    $("#stage").fadeOut(); //fades out the stage slide
    $.post("http://langcog.stanford.edu/cgi-bin/NPM_CLAV/clav_ipad_1_submit.php", {result_file_path : outfile, postresult_array : experiment_result_array}); //posts the results to the server using php
    experiment.end(); //calls the experiment's end function
    return;
}

/*Function: makePracticeImageTable
  Usage: makePracticeImageTable(condArray)
  Params: condArray, array containing info governing the current trial
  Returns: none
  Displays the images in dynamically created html according to specs from the condArray
  */
function makePracticeImageTable(condArray) {
    // Create the object table (tr=table row; td= table data)
    inits_html = '<table class = "centered" ><tr><td id=word colspan="2"></td></tr>';; //starts off the html block    
    //HTML for the object on the upper-left
    upperLeftName = 'images/' + condArray[6]; //gives name of dynamic left object, pulls from storage
    inits_html += '<tr><td align="center"><img class="practiceImg" src="' + upperLeftName +  '"alt="' + upperLeftName + '" id= "practiceupperLeftPic"/></td>'; //creates html for the object
    //HTML for the object on the upper-right
    upperRightName = 'images/' + condArray[7]; //gives name of dynamic right object, pulls from storage
    inits_html += '<td align="center"><img class="practiceImg" src="' + upperRightName +  '"alt="' + upperRightName + '" id= "practiceupperRightPic"/></td></tr>'; //creates html for the object
    //HTML for the object on the lower-left
    lowerLeftName = 'images/' + condArray[8]; //gives name of dynamic left object, pulls from storage
    inits_html += '<tr><td align="center"><img class="practiceImg" src="' + lowerLeftName +  '"alt="' + lowerLeftName + '" id= "practicelowerLeftPic"/></td>'; //creates html for the object
    //HTML for the object on the lower-right
    lowerRightName = 'images/' + condArray[9]; //gives name of dynamic right object, pulls from storage
    inits_html += '<td align="center"><img class="practiceImg" src="' + lowerRightName +  '"alt="' + lowerRightName + '" id= "practicelowerRightPic"/></td>'; //creates html for the object 
    inits_html += '</tr></table>'; //finishes the html block
    $("#inits").html(inits_html); //converts the block to actual html
    return;
}

/*Function: makeFirstImageTable
  Usage: makeFirstImageTable(condArray)
  Params: condArray, array containing info governing the current trial
  Returns: none
  Displays the images in dynamically created html according to specs from the condArray
  */
function makeFirstImageTable(condArray) {
    // Create the object table (tr=table row; td= table data)
    objects1_html = '<table class = "centered" ><tr><td id=word colspan="2"></td></tr>';; //starts off the html block    
    //HTML for the object on the upper-left
    upperLeftName = 'images/' + condArray[6]; //gives name of dynamic left object, pulls from storage
    objects1_html += '<tr><td align="center"><img class="pic0" src="' + upperLeftName +  '"alt="' + upperLeftName + '" id= "tbl1upperLeftPic"/></td>'; //creates html for the object
    //HTML for the object on the upper-right
    upperRightName = 'images/' + condArray[7]; //gives name of dynamic right object, pulls from storage
    objects1_html += '<td align="center"><img class="pic0" src="' + upperRightName +  '"alt="' + upperRightName + '" id= "tbl1upperRightPic"/></td></tr>'; //creates html for the object
    //HTML for the object on the lower-left
    lowerLeftName = 'images/' + condArray[8]; //gives name of dynamic left object, pulls from storage
    objects1_html += '<tr><td align="center"><img class="pic0" src="' + lowerLeftName +  '"alt="' + lowerLeftName + '" id= "tbl1lowerLeftPic"/></td>'; //creates html for the object
    //HTML for the object on the lower-right
    lowerRightName = 'images/' + condArray[9]; //gives name of dynamic right object, pulls from storage
    objects1_html += '<td align="center"><img class="pic0" src="' + lowerRightName +  '"alt="' + lowerRightName + '" id= "tbl1lowerRightPic"/></td>'; //creates html for the object 
    objects1_html += '</tr></table>'; //finishes the html block
    $("#objects1").html(objects1_html); //converts the block to actual html
    return;
}

/*Function: makeSecondImageTable
  Usage: makeSecondImageTable(condArray)
  Params: condArray, array containing info governing the current trial
  Returns: none
  Displays the images in dynamically created html according to specs from the condArray
  */
function makeSecondImageTable(condArray) {
    pic_counter = ".pic0"; //resets this to zero so multiple clicks at the end of block 1 don't screw things up
    // Create the object table (tr=table row; td= table data)
    objects2_html = '<table class = "centered" ><tr><td id=word colspan="2"></td></tr>';; //starts off the html block    
    //HTML for the object on the upper-left
    upperLeftName = 'images/' + condArray[6]; //gives name of dynamic left object, pulls from storage
    objects2_html += '<tr><td align="center"><img class="pic0" src="' + upperLeftName +  '"alt="' + upperLeftName + '" id= "tbl2upperLeftPic"/></td>'; //creates html for the object
    //HTML for the object on the upper-right
    upperRightName = 'images/' + condArray[7]; //gives name of dynamic right object, pulls from storage
    objects2_html += '<td align="center"><img class="pic0" src="' + upperRightName +  '"alt="' + upperRightName + '" id= "tbl2upperRightPic"/></td></tr>'; //creates html for the object
    //HTML for the object on the lower-left
    lowerLeftName = 'images/' + condArray[8]; //gives name of dynamic left object, pulls from storage
    objects2_html += '<tr><td align="center"><img class="pic0" src="' + lowerLeftName +  '"alt="' + lowerLeftName + '" id= "tbl2lowerLeftPic"/></td>'; //creates html for the object
    //HTML for the object on the lower-right
    lowerRightName = 'images/' + condArray[9]; //gives name of dynamic right object, pulls from storage
    objects2_html += '<td align="center"><img class="pic0" src="' + lowerRightName +  '"alt="' + lowerRightName + '" id= "tbl2lowerRightPic"/></td>'; //creates html for the object 
    objects2_html += '</tr></table>'; //finishes the html block
    $("#objects2").html(objects2_html); //converts the block to actual html
    return;
}

/*Function: redrawFirstTable
  Usage: redrawFirstTable(condArray)
  Params: condArray, array containing info governing the current trial
  Returns: none
  Displays the next images in dynamically created html according to specs from the condArray
  */
function redrawFirstTable(condArray) {
    var class_counter_abbrev = pic_counter.substr(1);
    console.log("new table class is " + class_counter_abbrev);
    var upperLeft = 'images/' + condArray[6];
    document.getElementById("tbl1upperLeftPic").src = upperLeft; //gets the next upper-left picture
    document.getElementById("tbl1upperLeftPic").className = class_counter_abbrev;
    var upperRight = 'images/' + condArray[7];
    document.getElementById("tbl1upperRightPic").src = upperRight; //gets the next upper-right picture
    document.getElementById("tbl1upperRightPic").className = class_counter_abbrev;
    var lowerLeft = 'images/' + condArray[8];
    document.getElementById("tbl1lowerLeftPic").src = lowerLeft; //gets the next lower-left picture
    document.getElementById("tbl1lowerLeftPic").className = class_counter_abbrev;
    var lowerRight = 'images/' + condArray[9];
    document.getElementById("tbl1lowerRightPic").src = lowerRight; //gets the next lower-right picture
    document.getElementById("tbl1lowerRightPic").className = class_counter_abbrev;
    return;
}

/*Function: redrawSecondTable
  Usage: redrawSecondTable(condArray)
  Params: condArray, array containing info governing the current trial
  Returns: none
  Displays the next images in dynamically created html according to specs from the condArray
  */
function redrawSecondTable(condArray) {
    var class_counter_abbrev = pic_counter.substr(1);
    console.log("new table class is " + class_counter_abbrev);
    var upperLeft = 'images/' + condArray[6];
    document.getElementById("tbl2upperLeftPic").src = upperLeft; //gets the next upper-left picture
    document.getElementById("tbl2upperLeftPic").className = class_counter_abbrev;
    var upperRight = 'images/' + condArray[7];
    document.getElementById("tbl2upperRightPic").src = upperRight; //gets the next upper-right picture
    document.getElementById("tbl2upperRightPic").className = class_counter_abbrev;
    var lowerLeft = 'images/' + condArray[8];
    document.getElementById("tbl2lowerLeftPic").src = lowerLeft; //gets the next lower-left picture
    document.getElementById("tbl2lowerLeftPic").className = class_counter_abbrev;
    var lowerRight = 'images/' + condArray[9];
    document.getElementById("tbl2lowerRightPic").src = lowerRight; //gets the next lower-right picture
    document.getElementById("tbl2lowerRightPic").className = class_counter_abbrev;
    return;
}


/*Function: playWebAudio
  Usage: playWebAudio()
  Params: wavFile, delay (ms)
  Returns: none
  Loads and plays the a sound */
function playWebAudio(wavFile, delay) {
    var bufferLoader;
    var pTime;

    /* schedule sound to play in the brave future */
    pTime = aC.currentTime + ( delay / 1000 );

    bufferLoader = new BufferLoader(
    aC,
    [
  wavFile,
    ],
    finishedLoading
    );

    bufferLoader.load();

function finishedLoading(bufferList) {
    // Create two sources and play them both together.
    var source = aC.createBufferSource();
    source.buffer = bufferList[0];
    source.connect( aC.destination );

    source.start( pTime );
    }

    return( pTime );
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

$(document).bind('touchmove',false);
showSlide("instructions"); //shows the instructions slide and is ready to start the experiment


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
        $('.dot').on('tap', function(event) {
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
            practiceBlock = data[0][1].split(",");
            console.log("practice Block is " + practiceBlock);
            block1 = makeBlock(data,2);
            block2 = makeBlock(data,14);
            $("#pleaseWait").html("")
            aC = new AudioContext();
            // this next line is here to make iOS work
            aC.createGain();
            playWebAudio( 'AudioClips/chimes.wav', 0 );
            $("#start").hide();
            setTimeout(function(){
                experiment.practice(practiceBlock);
            },pauseTime*2);
        } else { //password is incorrect or subjectID or ListID not given
            experiment.end(); //ends the experiment without collecting data
        }
        }, //finishes declaration of init method
/*
    Function: practice
    Usage: experiment.practice()
    Params: practiceBlock
    Returns: none
    Called after training when the first filler trial is about to begin during timeout.
    */
    practice : function(condArray) {
        for (var i = 0; i < condArray.length; i++) {
            condArray[i] = condArray[i].replace(/"/g, "");
            condArray[i] = condArray[i].replace(/\r/g, "");
        }
        makePracticeImageTable(condArray); //puts the images on the screen
        $("#practice").fadeIn("slow");
        playWebAudio(audioDir + condArray[1], pauseTime);
        $(".practiceImg").bind('click', function(event) {
            $("#practice").fadeOut("slow");
            experiment.runBlock1(block1);
        });
    },

/*Function: runBlock1
    Usage: experiment.runBlock1()
    Params: none
    Returns none
    Called when need to get a new trial; first called from experiment.practice 
    First called after training, calls itself until counter === numTrials var set at beginning*/
    runBlock1 : function(data) { //Will be the main display function
        trial_result_array = []; //initializes result_string variable that will hold the result of each trial, to be parsed later
        conditions = shuffle(conditions); //randomizes order of the trials
        var i = 0;
        console.log("i is " + i);
        condArray = []; //will hold condition information
        trial = conditions[i]; //gets trial index from shuffled conditions array
        condArray = createCondition(data, trial); //gets the values for the current trial
        makeFirstImageTable(condArray);
        $("#stage1").fadeIn("fast");
        start = playWebAudio( audioDir + condArray[1], pauseTime );
        /****THIS GOVERNS WHAT HAPPENS WHEN SOMETHING IS CLICKED!!!************/
        $(pic_counter).on('tap', function(event) {
            console.log("pic_counter is " + pic_counter);
            console.log("tap is ON");
            console.log("SOMETHING WAS CLICKED");
            /* first, get the current time from the audio hardware
               via the aC (AudioContext) object we initialized at the
               beginning of the experiment.  This time is
               extremely precise.  I'm not sure how much, if any,
               delay we can expect between the tap and calling
               the currentTime method.  This needs to be tested.
               --kevin
            */
            end = aC.currentTime;
            console.log("start: " + start + " end: " + end );
            diff = end - start; //gets reaction time
            console.log("diff is " + diff);
            var picID = $(event.currentTarget).attr('id'); //assigns what is currently being clicked to variable of picID
            i++;
            pic_counter = ".pic" + i;
            console.log(".pic class ID is " + pic_counter);
            console.log("i is " + i);
            var picID_string = picID.substring(0,picID.length - 3).substring(4,picID.length);
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
            trial_result_array[clicked] = picID_string;
            trial_result_array[correct] = condArray[10];
            trial_result_array[AudioPlayedTime] = start;
            trial_result_array[TapTime] = end;
            trial_result_array[RT] = diff;
            experiment_result_array[i] = trial_result_array; //adds this trial's results to the overall result array
            trial_result_array = []; //resets the trial array holder
            /***If experiment complete, submit data to server***/
            if (i === numTrials) { //if we're in the first block and at the end of the trials
                setTimeout(function() {
                    experiment.filler(); //launches the pause screen for outside game 
                },pauseTime);
            } else { //more trials to do!
                console.log("more trials to do!");
                $("#stage1").fadeOut(700); //fades out the last pictures
                trial = conditions[i]; //gets the next trial
                console.log("trial is " + trial);
                condArray = createCondition(data, trial); //gets the next condition information as an array
                //gets the next set of stimuli
                $("#stage1").hide();
                redrawFirstTable(condArray); //redraws the html accordingly
                $("#stage1").fadeIn(700); //displays the new stimuli on the screen
                start = playWebAudio(audioDir + condArray[1], pauseTime);
            }
        }); //finishes tap handler
    }, //finishes declaration of runBlock1 method

/*Function: filler
    Usage: experiment.filler()
    Params: none
    Returns none
    Called after the first block; first called from experiment.runBlock1   
    First called after runBlock1, and contains a button that will call runBlock2*/
    filler : function() {
        $("#stage1").fadeOut("slow");
        showSlide("filler");
        $("#fillerButton").bind('click', function(event) {
            $("#filler").fadeOut("slow");
            experiment.runBlock2(block2);
        }); //ends event handler
    },

/*Function: runBlock2
    Usage: experiment.runBlock2()
    Params: block2
    Returns none
    Called when need to get a new trial after the first block; first called from experiment.filler   
    First called after filler, calls itself until counter === numTrials var set at beginning*/
    runBlock2 : function(data) { //Will be the main display function
        trial_result_array = []; //initializes result_string variable that will hold the result of each trial, to be parsed later
        conditions = shuffle(conditions); //randomizes order of the trials
        console.log("conditions is " + conditions);
        var j = 0;
        var trial_index = j;
        console.log("j is " + j);
        condArray = []; //will hold condition information
        trial = conditions[j]; //gets trial index from shuffled conditions array
        condArray = createCondition(data, trial); //gets the values for the current trial
        makeSecondImageTable(condArray);
        $("#stage2").fadeIn("slow");
        start = playWebAudio( audioDir + condArray[1], pauseTime );
        /****THIS GOVERNS WHAT HAPPENS WHEN SOMETHING IS CLICKED!!!************/
        $(pic_counter).on('tap', function(event) {
            console.log("pic_counter is " + pic_counter);
            console.log("SOMETHING WAS CLICKED");
            /* first, get the current time from the audio hardware
               via the aC (AudioContext) object we initialized at the
               beginning of the experiment.  This time is
               extremely precise.  I'm not sure how much, if any,
               delay we can expect between the tap and calling
               the currentTime method.  This needs to be tested.
               --kevin
            */
            end = aC.currentTime;
            console.log("start: " + start + " end: " + end );
            diff = end - start; //gets reaction time
            console.log("diff is " + diff);
            var picID = $(event.currentTarget).attr('id'); //assigns what is currently being clicked to variable of picID
            j++;
            pic_counter = ".pic" + j;
            console.log(".pic class ID is " + pic_counter);
            console.log("j is " + j);
            var picID_string = picID.substring(0,picID.length - 3).substring(4,picID.length);
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
            trial_result_array[clicked] = picID_string;
            trial_result_array[correct] = condArray[10];
            trial_result_array[AudioPlayedTime] = start;
            trial_result_array[TapTime] = end;
            trial_result_array[RT] = diff;
            experiment_result_array[experiment_result_array.length] = trial_result_array; //adds this trial's results to the overall result array
            trial_result_array = []; //resets the trial array holder
            /***If experiment complete, submit data to server***/
            if (j === numTrials) { //if we're in the first block and at the end of the trials
                submitData();
            } else { //more trials to do!
                $("#stage2").fadeOut(700); //fades out the last pictures
                trial = conditions[j]; //gets the next trial
                console.log("trial is " + trial);
                condArray = createCondition(data, trial); //gets the next condition information as an array
                //gets the next set of stimuli
                $("#stage2").hide();
                redrawSecondTable(condArray); //redraws the html accordingly
                $("#stage2").fadeIn(700); //displays the new stimuli on the screen
                start = playWebAudio(audioDir + condArray[1], pauseTime);
            }
        }); //finishes tap handler
    }, //finishes declaration of runBlock2 method

/*Function: end
    Usage: experiment.end()
    Params: none
    Returns: none
    called when the number of trials is up; everything's over */
    end : function() { //governs how the experiment will end
        showSlide("finish"); //shows the 'finish' slide from the html file
        playWebAudio( 'AudioClips/chimes.wav', 0 );
        console.log( experiment_result_array );
    }, //finishes declaration of end method
}
