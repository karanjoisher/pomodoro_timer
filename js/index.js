function Clock() {
  var durationCopy = '';
      this.durationSecCopy = 0;
  this.duration = '';
  this.durationSec = 0;
  this.timeElapsed = 0;
  this.set = function(duration) {
    this.duration = duration;
    durationCopy = duration;
    duration = strToIntArr(duration);
    this.durationSec = convertTosec(duration);
    this.durationSecCopy = this.durationSec;
    this.timeElapsed = 0;
  };

  this.reset = function() {
    this.duration = durationCopy;
    this.durationSec = this.durationSecCopy;
    this.timeElapsed = 0;
  };
  
  

  this.decrement = function(s){
    this.durationSec -= s;
    this.duration = secToTime(this.durationSec);
    this.timeElapsed += s;
  }
};

/* Globals */
var Break = new Clock();
var Session = new Clock();
var audio = new Audio('http://www.soundjay.com/appliances/sounds/microwave-oven-bell-1.mp3');
var record = [];
var timerId;
var stateIndex = 0;
var currentState = Session;
var statesHtml = ['SESSION','BREAK'];
var states = [Session, Break];
var pi = Math.PI;
var spriteXpos = 5;
var coins = 0;


//HTML elements
var timeDisplay = $('#time');
var can = document.getElementById('can');
var ctx = can.getContext('2d');

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var sprite = $('.sprite');
var stats = $('.stats');
var cancelGraph = $('.graph-cancel');
var stateDisplay = $('#state');

var coinsDisplay = $('.coins');
var startButton = $('.start');
var resetButton = $('.reset');
var breakInput = $('.break');
var sessionInput = $('.session');
var pomodoroScreen = $('.pomodoro');
var introductionScreen = $('.introduction');
var graphScreen = $('.graph-container');
/*Helper Functions*/
function largestNum(arr){
  return Math.max.apply(Math,arr);
};

function truncate(text){
  text = text.split('.');
  if (text.length == 2){
    var decimal = text[1].slice(0,2);
    return text[0]+'.'+decimal;
  }
  return text[0];
};

function graph(arr){
  var lineWidth = 30;
  var maxValue = largestNum(arr);
  var Xpos = 30;
  var Ypos = 270;
  var maxLineHeight = Ypos - 30;
  var margin = 10;
  var factor = maxLineHeight/maxValue;
  var lineHeight;
  can.width = Xpos + (lineWidth+margin)*arr.length;
  
  
  
  for(var i = 0; i < arr.length;i++){
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = '#F44336';
    ctx.moveTo(Xpos,Ypos);
    lineHeight = arr[i]*factor;
    ctx.lineTo(Xpos,Ypos-lineHeight);
    ctx.stroke();
    
    
    
    ctx.textAlign = 'center';
    ctx.font = 'bold 12px sans-serif';
    var text = truncate((arr[i]/60)+'');
    
    ctx.fillText(text, Xpos, Ypos-lineHeight-2);
    
    
    
    Xpos += lineWidth + margin;
    
  }
  
};



function scoreUpdate(time){
  if(0<time&&time<=9){
    coins++;
    return 0;
  }
  else if(10<=time && time<30){
    coins += 5;
    scoreUpdate(time-10);
  }
  else if(time >= 30){
    coins += 20;
    scoreUpdate(time-30);
  }
  else{return 0;}
};



function strToIntArr(str){
  var array = str.split(':');
    array.forEach(function(val,i,arr){
      arr[i] = parseInt(val);
    });
  return array;
};

function IntArrToStr(arr){
  arr.forEach(function(val, i, arr) {
    if (val < 10) {
      arr[i] = '0' + val;
    } else {
      arr[i] = '' + val;
    }

  });
  return arr.join(':');
};


function secToTime(sec){
  var timeArr,seconds,minutes,hours;
  hours = parseInt( sec / 3600 ) % 24;
minutes = parseInt( sec / 60 ) % 60;
seconds = sec % 60;
  
  if(hours === 0){
    timeArr= [minutes,seconds];  
  }
  else{
     timeArr= [hours,minutes,seconds];
  }
  return IntArrToStr(timeArr);
  
 
  
};

function convertTosec(arr) {
  var sec = arr[arr.length - 1];
  var mins = arr[arr.length - 2] * 60;
  var hours = 0;
  if (arr.length === 3) {
    hours = arr[0] * 3600;
  }

  return sec + mins + hours;

};

function inputValidation(Clock, value) {
  value = strToIntArr(value);
  var len = value.length;
  if (len < 2) {
    alert("Minimum duration:5:00\nMaximum duration:2:00:00\nNote:The format must be of form xhrs:yymins:zzseconds if duration you wish to set is greater than 59 minutes, else of the form 0:yymins:zzseconds or yymins:zzseconds");
    return -1;
  }
  if (len === 3) {
    if (!((0 <= value[0]) && (value[0] <= 2))) {
      alert('Hours should be in range of 0 to 2');
      return -1;
    }
  }
  if (!((0 <= value[len - 2]) && (value[len - 2] <= 59))) {
    alert('Minutes should be in range of 0 to 59');
    return -1;
  }
  if (!((0 <= value[len - 1]) && (value[len - 1] <= 59))) {
    alert('Seconds should be in range of 0 to 59')
    return -1;
  }
  var duration = convertTosec(value);
  if (!((300 <= duration) && (duration <= 7200))) {
    alert('Minimum Duration: 5:00\nMaximum Duration: 2:00:00');
    return -1;
  }

  value = IntArrToStr(value);
  Clock.set(value);
};

function startTimer() {
  
  timerId = setInterval(
    function() {      currentState.decrement(1);//Decrement by 1 sec
     
      timeDisplay.html(currentState.duration);//update clock display
      draw();//update canvas
      
      if(!stateIndex && (!(currentState.timeElapsed%parseInt(currentState.durationSecCopy/3)))){
       
        updateSprite();}
      
      if (currentState.durationSec===0) {
        
        clearInterval(timerId);//stop timer
        currentState.reset();// reload timer
        audio.play();
        if(!stateIndex){
record.push(currentState.durationSecCopy);          scoreUpdate(currentState.durationSecCopy/60);}//update score
     coinsDisplay.html(coins);   
        stateIndex = (stateIndex + 1) % 2;//next state
        currentState = states[stateIndex];// next state
        setTimeout(function(){updateSprite();
                              stateDisplay.html(statesHtml[stateIndex]);
                              startTimer();
                             },3000);}//starttimer

    }
      
    , 1000
  )
};

function start(){
  if(Session.durationSec != 0 && Break.durationSec != 0){
    introductionScreen.css('display','none');
    stats.css('display','none');
    pomodoroScreen.css('display','block');
    graphScreen.css('display','none');
    startTimer();
  }
  else{
    alert('Please Enter Valid Input');
  }
};

function reset(){
  clearInterval(timerId);
  graphScreen.css('display','none');
  pomodoroScreen.css('display','none');
  introductionScreen.css('display','block');
  stats.css('display','inline');
  stateIndex = 0;
  currentState = Session;
  Session.set('00:00');
  Break.set('00:00');
  breakInput.val('');
  sessionInput.val('');
  spriteXpos = 5;
};

function draw() {
  var angle = 2 * pi * currentState.timeElapsed / currentState.durationSecCopy;
  context.clearRect(0, 0, 300, 300); // clear canv  
  context.save();
  context.beginPath();
  context.lineWidth = 15;
  context.strokeStyle = 'white';
  context.arc(150, 150, 100, 0, 7, false);
  context.stroke();
  context.restore();

  context.save();
  context.beginPath();
  context.lineWidth = 15;
  context.strokeStyle = '#F44336';
  context.rotate(-pi / 2);
  context.arc(-150, 150, 100, 0, angle, false);
  context.stroke();
  /*Uncomment to add revolving head
  context.beginPath();
  context.translate(-150, 150);
  context.rotate(angle);
  context.arc(140, 0, 14, 0, 2 * pi, false);
  context.fill();*/
  context.restore();
};

function updateSprite() {
    spriteXpos = (spriteXpos + 106)%530;
    sprite.fadeOut(function() {
      sprite.css('background-position','-'+spriteXpos+'px' + ' -5px');
      $(this).fadeIn();
    });
  };


$(document).ready(function(){
  
  sessionInput.change(function(){
    inputValidation(Session,$(this).val());
  });
  
  breakInput.change(function(){
    inputValidation(Break,$(this).val());
  });
    
  startButton.click(start);
  resetButton.click(reset);
  stats.click(function(){
    graphScreen.css('display','block');
    graph(record);
    stats.css('display','none');
    introductionScreen.css('display','none');
    pomodoroScreen.css('display','none');
  })
});

cancelGraph.click(function(){
  stats.css('display','inline');
  introductionScreen.css('display','block');
  pomodoroScreen.css('display','none');
  graphScreen.css('display','none');
});

/*
Session.set('0:10');
Break.set('0:10');
startTimer();*/