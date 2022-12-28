doc = document;
studentPageDiv = doc.getElementById('students');
openWindows = [];
latestCheckout = [];


class Student{
  constructor(student_info){
    this.info = student_info;
    //import all elements of info as properties
    Object.entries(student_info).forEach(([key, value]) => {
      this[key] = value;
    })
  }
  makeDiv(parentDiv){
    let div = doc.createElement('div');
    div.classList.add("student");
    div.setAttribute("id", `id_${this.id}`);

    div.style.backgroundColor = getStudentColorCode(this.grade);

    let nameDiv = doc.createElement('div');
    nameDiv.classList.add("studentName");
    nameDiv.innerHTML = this.name;
    div.appendChild(nameDiv);

    let timeDiv = doc.createElement('div');
    timeDiv.classList.add("classTime");
    let txt = '';
    for (const dt of this.classTime) {
      txt += `${dt.day} ${dt.time}<br>`;
    }
    timeDiv.innerHTML = txt;
    div.appendChild(timeDiv);
    parentDiv.appendChild(div);

    //listener
    div.addEventListener("click", () => {
      confWin.makeWindow(this);
    });
    this.div = div;
  }
  makeSelectOption(selDiv){
    let sel = doc.createElement('option');
    sel.value = this.id;
    sel.text = this.name;
    sel.style.backgroundColor = getStudentColorCode(this.grade);
    selDiv.add(sel);
  }
  outputTable({
          loginTimes=[],
          clear=true,
          targetDiv = 'result'
        }={}){

    let outDiv = doc.getElementById("result");
    let h = doc.createElement('h3');
    h.innerHTML = "Login/Logout";
    if (clear) { outDiv.innerHTML = ""; }
    outDiv.appendChild(h);

    loginTimes = JSON.parse(loginTimes);

    if (loginTimes.length === 0) {
      let dataDiv = doc.createElement('div');
      dataDiv.innerHTML = `No login data`;
      outDiv.appendChild(dataDiv);
    }
    else {
      loginTimes = splitDateTimeInArray(loginTimes);

      this.table = makeTable(outDiv, loginTimes);
    }

  }
  outputCalendar({
          loginTimes = [],
          targetDiv='result',
          clear=true
        } = {}){

    let outDiv = doc.getElementById(targetDiv);
    let h = doc.createElement('h3');
    h.innerHTML = "Login/Logout";
    if (clear) { outDiv.innerHTML = ""; }
    outDiv.appendChild(h);

    loginTimes = JSON.parse(loginTimes);

    if (loginTimes.length === 0) {
      let dataDiv = doc.createElement('div');
      dataDiv.innerHTML = `No logins for calendar.`;
      outDiv.appendChild(dataDiv);
    }
    else {

      makeCalendar(outDiv, loginTimes);
    }

  }
}

function makeCalendar(parentDiv, a = [], settings={}){
  //add div for calendar
  let calDiv = doc.createElement("div");
  parentDiv.appendChild(calDiv);
  let events = [];
  for (let event of a){
    let t = getTime(event.time);
    let [y,m,d] = t.ymd;
    let e = {
      Date: new Date(y, m, d), //new Date(event.time),
      Title: event.action
    }
    events.push(e);
  }

  caleandar(calDiv, events, settings);
}

class confirmWindow{
  constructor({parentDivId="students", divId='confirmWindow', ws=undefined} = {}){

    this.parentDivId = parentDivId;
    this.divId = divId;
    this.ws = ws;
    //this.iPads = iPads; //from iPads.js

    this.button = {};

    this.parentDiv = doc.getElementById(parentDivId);
  }

  makeWindow(student){
    this.student = student;

    this.div = doc.createElement("div");
    this.div.setAttribute("id", 'signIn');
    //this.div.classList.add('signIn');

    //this.makeCancelButton();
    this.cancelBut = new cancelButton(this.div, true);

    //put student name on page
    let nameTitle = doc.createElement('div');
    nameTitle.innerHTML = `<h1>${student.name}</h1>`;
    this.div.appendChild(nameTitle);

    // add time to page:
    let t = getTime();
    let tDiv = doc.createElement('div');
    tDiv.innerHTML = `${t.date} <br> ${t.time} `;
    this.div.appendChild(tDiv);

    this.makeOptions(t);

    this.parentDiv.appendChild(this.div);
    //openWindows.push(this.div);
  }

  makeOptions(t){
    let optionsDiv = doc.createElement("div");
    optionsDiv.classList.add("student_opts");

    //sign in
    this.makeSignInButton(optionsDiv, t, "Sign In");
    this.makeSignInButton(optionsDiv, t, "Sign Out");
    //history
    this.makeHistoryButton(optionsDiv);

    //checkout buttons
    let i = 0;
    for (let item of Object.keys(inventory)){
      i += 1;
      this.makeCheckoutButton(optionsDiv, t, item, "Check Out", {row: 1, col:i});
      this.makeCheckoutButton(optionsDiv, t, item, "Check In", {row: 2, col:i});
    }

    this.div.appendChild(optionsDiv);
  }

  makeSignInButton(div, t, action="Sign In"){
    let signInButton = getButton({
                          title: action,
                          info:t.time
                        });
    if (action == 'Sign Out'){
      signInButton.style.gridColumn = 5;
      signInButton.style.gridRow = 2;
    }
    else if (action == 'Sign In'){
      signInButton.style.gridColumn = 5;
      signInButton.style.gridRow = 1;
    }
    div.appendChild(signInButton);
    signInButton.addEventListener("click", () => {
      //console.log("sign in", this);
      let msg = {
        what: "sign in",
        info: {
          name: this.student.name,
          id: this.student.id,
          action: action,
          time: t.dateObject.toJSON()
        }
      };
      this.ws.send(JSON.stringify(msg));
    })
  }

  makeHistoryButton(div){

    let button = doc.createElement('div');
    button.innerHTML = "History";
    button.classList.add('mediumButton');

    button.style.gridColumn = 5;
    button.style.gridRow = 3;

    div.appendChild(button);

    button.addEventListener("click", () => {
      //console.log("sign in", this);
      let historyWindow = doc.createElement('div');
      historyWindow.classList.add("inventoryWindow");
      historyWindow.innerHTML = `<h2>${this.student.name}</h2>`;
      let closeButton = new cancelButton(historyWindow);
      let calendarDiv = doc.createElement("div");
      calendarDiv.setAttribute("id", "studentCalendar");
      historyWindow.appendChild(calendarDiv);
      this.parentDiv.appendChild(historyWindow);


      let msg = {
        what: "studentSignInHistory",
        studentId: this.student.id
      };
      this.ws.send(JSON.stringify(msg));
    })
  }

  makeCheckoutButton(div, t, item="iPads", action="Check Out", pos = {row:1, col:1}){

    this.button[item] = getCheckoutButton({
      title: action,
      type: item.slice(0,-1)
    });

    this.button[item].style.gridColumn = pos.col;
    this.button[item].style.gridRow = pos.row;

    div.appendChild(this.button[item]);


    this.button[item].addEventListener("click", () => {

      // if (item == 'iPads'){
      //   var inventory = this.iPads;
      // }

      let inventoryWindow = new checkoutControl({
        parentDiv: this.parentDiv,
        itemName: item,
        items: inventory[item],
        ws: this.ws,
        student: this.student,
        action: action
      });

    })
  }

}

class checkoutControl{
  constructor({
                itemName = "iPads",
                items = iPads,
                parentDiv = undefined,
                ws = undefined,
                student = undefined,
                action = "Check Out"
              } = {}){

    this.ws = ws;
    this.itemName = itemName;
    this.items = items;
    this.parentDiv = parentDiv;
    this.student = student;
    this.action = action;

    this.makeWindow();
  }
  makeWindow(){
    this.window = doc.createElement('div');
    this.window.classList.add('inventoryWindow');
    this.cancelBut = new cancelButton(this.window, true);

    //header
    let h = doc.createElement('h2');
    h.innerHTML = `${this.itemName} ${this.action}`;
    this.window.appendChild(h);

    //items
    let itemListDiv = doc.createElement('div');
    itemListDiv.classList.add('itemList');
    this.window.appendChild(itemListDiv);


    for (let i = 0; i < this.items.length; i++){
      this.items[i].button = getButton({
                                title: this.items[i].name,
                                infoId: `${this.itemName}-${this.items[i].id}`,
                                className: `${this.itemName.slice(0,-1)}Button`
                              });
      //this.items[i].button.classList.add('item');
      //this.items[i].button.classList.add(`${this.itemName.slice(0,-1)}Button`);

      itemListDiv.append(this.items[i].button);

      this.items[i].button.addEventListener("click", () => {

        console.log( `${this.student.name} checking out ${this.items[i].name}`);
        let t = getTime();
        let msg = {
          what: "checkout",
          info: {
            action: this.action,
            itemType: this.itemName,
            name: this.student.name,
            studentId: this.student.id,
            item: this.items[i].name,
            itemId: this.items[i].id,
            time: t.dateObject.toJSON()
          }
        };
        this.ws.send(JSON.stringify(msg));
      });

    }

    this.parentDiv.appendChild(this.window);
    //openWindows.push(this.window);

    //get last status info
    getCheckoutInfoForUser(this.ws, this.itemName);

  }
}
class cancelButton{
  constructor(parentDiv = undefined, closeAll=false){
    this.parentDiv = parentDiv;
    this.closeAll = closeAll;
    this.button = doc.createElement("input");
    this.button.setAttribute("type", "button");
    this.button.setAttribute("value", "Close");
    this.button.classList.add('closeButton');

    this.parentDiv.appendChild(this.button);
    openWindows.push(this.parentDiv);

    this.button.addEventListener('click', () => {
      //this.parentDiv.remove();

      if (closeAll) {
        openWindows.forEach(div => div.remove());
        openWindows = [];
      }
      else {
        this.parentDiv.remove();
      }

    })
    //return this.button;
  }
}


function getButton({
            title="Hello",
            info="-",
            className="bigButton",
            infoId = "infoButton"
          }={}){
  let button = doc.createElement('div');
  button.classList.add(className);

  let titleDiv = doc.createElement('div');
  titleDiv.classList.add('bigButtonTitle');
  titleDiv.innerHTML = title;
  button.appendChild(titleDiv);

  let infoDiv = doc.createElement('div');
  infoDiv.classList.add("bigButtonInfo");
  infoDiv.setAttribute("id", infoId);
  infoDiv.innerHTML = info;
  button.appendChild(infoDiv);

  return button;

}

function getCheckoutButton({
            title="Hello",
            type='iPad',
            className='iPadButton'
          } = {}){
  let button = doc.createElement('div');

  button.classList.add(`${type}Button`);

  let titleDiv = doc.createElement('div');
  titleDiv.classList.add('bigButtonInfo');
  titleDiv.innerHTML = title;
  button.appendChild(titleDiv);

  let infoDiv = doc.createElement('div');
  infoDiv.classList.add("bigButtonTitle");
  infoDiv.innerHTML = type;
  button.appendChild(infoDiv);

  return button;

}

function getGradeButton(gradeLevel = 'Faculty', parentDiv = doc.getElementById('byGrade')){

  //let button = getButton({title: gradeLevel});
  let button = doc.createElement('div');
  button.classList.add('gradeButton');
  button.innerHTML = gradeLevel;
  button.addEventListener('click', () => {
    students.showStudents(gradeLevel);
  })
  parentDiv.appendChild(button);
  return button;
}

function getTime(setTime = undefined){
  //time
  let t = setTime === undefined ? new Date() : new Date(setTime);
  let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  let shortDateOptions = { weekday: 'short', year: '2-digit', month: 'short', day: 'numeric'};
  let shortOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' , hour: '2-digit', minute: '2-digit'};
  let ymd = [t.getFullYear(), t.getMonth(), t.getDate()];

  let dt = {
    dateObject: t,
    date: t.toLocaleDateString('en-US', options),
    shortDate: t.toLocaleDateString('en-US', shortDateOptions),
    short: t.toLocaleString('en-US', shortOptions),
    time: t.toLocaleTimeString(),
    ymd: ymd
  };

  return dt;

}

function splitDateTime(t){
  let tv = getTime(t);
  return({
    Time: tv.time,
    Date: tv.shortDate
  });
}

function splitDateTimeInArray(a=[]){
  for (let i=0; i<a.length; i++){
    a[i] = {...a[i], ...splitDateTime(a[i].time)};
  }
  return a;
}

function getStudentColorCode(grade){
  let bg;
  switch(parseInt(grade)){
    case 2021:
      bg = '#ffb795';
      break;
    case 2022:
      bg = '#ffec95';
      break;
    case 2023:
      bg = '#d695ff';
      break;
    case 2024:
      bg = '#95e6ff';
      break;
    default:
      bg = '#ffea95';
  }
  return bg;
}


function makeTable(parentDiv, a = [], props = [], reverse = true){
  // default props makes table  of all properties


  // do all properties
  if (props.length === 0){ props = Object.keys(a[0]); }
  //reverse data
  let data = reverse ? a.reverse() : a;

  let table = doc.createElement('table');

  //Make header
  let tHead = table.createTHead();
  let row = tHead.insertRow();
  for (let h of props){
    let th = doc.createElement('th');
    let txt = doc.createTextNode(h);
    th.appendChild(txt);
    row.appendChild(th);
  }

  //Table body
  let t;
  for (let element of data){
    let row = table.insertRow();
    //console.log('Element:', element)
    for (let key of props){
      //console.log("   key: ", key)
      let cell = row.insertCell();
      let txt = doc.createTextNode(element[key]);
      cell.appendChild(txt);
    }
  }

  parentDiv.appendChild(table);

  return table;

}

function getCheckoutInfoForUser(ws, itemType){
  let msg = {
    what: "lastStatus",
    itemType: itemType,
    itemNames: itemDBs[itemType].getItemNames()
  }
  ws.send(JSON.stringify(msg));
}
function populateItemStatus(data){
  for (let i=0; i<data.length; i++){
    let id = `${data[i].itemType}-${data[i].itemId}`;
    let div = doc.getElementById(id);
    let txt = data[i].action.split(" ")[1];
    div.innerHTML = `${txt}: ${data[i].name}`;
  }
}



function makeStudentPage(ws){
  //put students on page
  // for (let i=0; i<students.db.length; i++){
  //   let s = students.db[i];
  //   s.makeDiv(studentPageDiv);
  // }
  students.showStudents('Makerspace');

  //set up for grade levels
  console.log(students.gradeList);
  getGradeButton('Makerspace');
  getGradeButton();
  getGradeButton('Seniors');
  getGradeButton('Juniors');
  getGradeButton('Sophmores');
  getGradeButton('Freshmen');
  getGradeButton('Middle School');


}

class messageWindow{
  constructor({
                parentDiv = doc.getElementById('students'),
                ws = undefined,
                msg = 'Hi!'
              } = {}){

    this.ws = ws;
    this.parentDiv = parentDiv;
    this.msg = msg;

    this.makeWindow();
  }
  makeWindow(){
    this.window = doc.createElement('div');
    this.window.classList.add('messageWindow');
    //this.window.innerHTML = this.msg;
    this.cancelBut = new cancelButton(this.window, true);

    let m = doc.createElement('div');
    m.classList.add('message');
    m.innerHTML = this.msg;
    this.window.appendChild(m);

    this.parentDiv.appendChild(this.window);
    //openWindows.push(this.window);
  }
}



class studentDB{
  constructor(roll){
    this.roll = roll;
    this.db = [];
    for (let i=0; i<roll.length; i++){
      this.db.push( new Student(roll[i]) );
    }
    this.n = this.db.length;
    this.gradeList = this.getGradeList();
  }
  getById(id){
    id = parseInt(id);
    for (let i=0; i<this.n; i++){
      if (this.db[i].id === id){
        return this.db[i];
      }
    }
    return undefined;
  }
  getGradeList(){
    let ct = 0;
    let gradeList = [];
    for (let i=0; i<this.n; i++){
      let l_add = true;
      for (let g of gradeList){
        if ( g === this.db[i].grade ) { l_add = false; }
      }
      if (l_add) { gradeList.push(this.db[i].grade); }
    }
    return gradeList;
  }
  showStudents(who="all"){
    let gradeYear;
    who = who.toLowerCase();

    let t = new Date();
    let y = t.getFullYear();
    let m = t.getMonth();

    if (who === 'faculty'){
      gradeYear = [1970];
    }
    else if (who === 'seniors'){
      gradeYear = m >= 7 ? [y+1] : [y];
    }
    else if (who === 'juniors'){
      gradeYear = m >= 7 ? [y+2] : [y+1];
    }
    else if (who === 'sophmores'){
      gradeYear = m >= 7 ? [y+3] : [y+2];
    }
    else if (who === 'freshmen'){
      gradeYear = m >= 7 ? [y+4] : [y+3];
    }
    else if (who === 'middle school'){
      gradeYear = m >= 7 ? [y+5, y+6] : [y+4, y+5];
    }


    studentPageDiv.innerHTML = ''; //empty

    console.log("gradeYear:", gradeYear);

    if (gradeYear !== undefined){
      for (let i=0; i<this.n; i++){
        if ( gradeYear.includes(this.db[i].grade) ){
          this.db[i].makeDiv(studentPageDiv);
        }
      }
    }

    if (who === 'makerspace'){
      for (let i=0; i<this.n; i++){
        if ( this.db[i].classTime.length > 0 ){
          this.db[i].makeDiv(studentPageDiv);
        }
      }
    }


  }
}
students = new studentDB(roll);



class Item{
  constructor(info, itemType){
    this.info = info;
    //import all elements of info as properties
    Object.entries(info).forEach(([key, value]) => {
      this[key] = value;
    })
    this.itemType = itemType;
  }

  makeSelectOption(selDiv){
    let sel = doc.createElement('option');
    sel.value = this.id;
    sel.text = this.name;
    selDiv.add(sel);
  }

  checkoutTable(data){

    data = JSON.parse(data);
    data = splitDateTimeInArray(data);
    console.log("Item Data: ", data);

    let resultTable = doc.createElement('table');

    let tableProps = ['action', 'name', 'studentId', 'Date', 'Time'];
    let outDiv = doc.getElementById("result");
    let h = doc.createElement('h3');
    h.innerHTML = `Check In/Out ${this.itemType}[${this.id}]: ${this.name}`;
    outDiv.innerHTML = "";
    outDiv.appendChild(h);
    makeTable(outDiv, data, tableProps, true);

  }
}



class itemDB{
  constructor(items = iPads, itemType="iPads"){
    this.items = items;
    this.itemType = itemType;
    this.db = [];
    for (let i=0; i<this.items.length; i++){
      this.db.push( new Item(this.items[i], itemType) );
    }
    this.n = this.db.length;
  }
  getById(id){
    id = parseInt(id);
    for (let i=0; i<this.n; i++){
      if (this.db[i].id === id){
        return this.db[i];
      }
    }
    return undefined;
  }
  getItemNames(){
    let names = [];
    for (let item of this.db){
      names.push(item.name);
    }
    return names;
  }
  checkoutStatusTable(msg, itemType){

    let outDiv = doc.getElementById("result");
    let h = doc.createElement('h3');
    h.innerHTML = `${itemType} Status`;
    outDiv.innerHTML = "";
    outDiv.appendChild(h);

    let data = JSON.parse(msg);

    data = splitDateTimeInArray(data);

    let props = ['item', 'name', 'action', 'Time', 'Date']

    let table = makeTable(outDiv, data, props, false);

  }
}
itemDBs = {};
for (let item of Object.keys(inventory)){
  console.log(item);
  itemDBs[item] = new itemDB(inventory[item], item);
}


function itemPicker(ws, item='iPads'){
  //let items = inventory[item];
  //this.items = new itemDB(inventory[item]);
  items = itemDBs[item];

  let queryDiv = doc.getElementById('query');
  let resultDiv = doc.getElementById('result');
  // //Title
  let itemSelDiv = doc.createElement("div");
  itemSelDiv.setAttribute('id', 'itemSelector');
  itemSelDiv.classList.add('queries');
  let title = doc.createElement('div');
  title.innerHTML = item;
  itemSelDiv.appendChild(title);
  queryDiv.appendChild(itemSelDiv);

  //select box
  let selectBox = doc.createElement('select');
  selectBox.setAttribute('id', `select${item}`);
  //default option:
  let defOpt = doc.createElement('option');
  defOpt.text = `Select ${item.slice(0,-1)}`;
  defOpt.value = ``;
  selectBox.appendChild(defOpt);

  items.db.forEach(i => i.makeSelectOption(selectBox));

  itemSelDiv.appendChild(selectBox);

  selectBox.addEventListener('change', function() {
    let msg = {
      what: "selectItemData",
      itemType: item,
      id: this.value
    };
    ws.send(JSON.stringify(msg));
  })

  //All status button
  let lastStatusButton = doc.createElement('div');
  lastStatusButton.innerHTML = `${item} status`;
  lastStatusButton.classList.add('mediumButton');
  lastStatusButton.addEventListener('click', function(){
    let msg = {
      what: "lastStatus",
      itemType: item,
      itemNames: itemDBs[item].getItemNames()
    }
    ws.send(JSON.stringify(msg));
  })

  itemSelDiv.appendChild(lastStatusButton);


}


//ADMIN STUFF

function studentPicker(ws){
  let queryDiv = doc.getElementById('query');
  let resultDiv = doc.getElementById('result');
  // //Title
  let studentSelDiv = doc.createElement("div");
  studentSelDiv.setAttribute('id', 'studentSelector');
  studentSelDiv.classList.add('queries');
  let title = doc.createElement('div');
  title.innerHTML = 'Students';
  studentSelDiv.appendChild(title);
  queryDiv.appendChild(studentSelDiv);

  //select box
  let selectBox = doc.createElement('select');
  selectBox.setAttribute('id', 'selectStudent');
  //default option:
  let defOpt = doc.createElement('option');
  defOpt.text = "Select Student";
  defOpt.value = '';
  selectBox.appendChild(defOpt);

  students.db.forEach(s => s.makeSelectOption(selectBox));

  studentSelDiv.appendChild(selectBox);

  selectBox.addEventListener('change', function() {
    let msg = {
      what: "selectStudent",
      studentId: this.value
    };
    ws.send(JSON.stringify(msg));
  })
}
