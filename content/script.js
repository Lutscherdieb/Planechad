var maxID = 0
var planesData = ""
var currentCounter = 0
var currentPlane = ""
var tagsData = ""
var selected = false
var interactableStars = false
var interactableCounter = true
var tagsChanged = false

// Start
window.onload = function () {
    // fetch planes json
    fetchAsync('plane/')
    .then(data => {
        // When planes are fetched create Deck dict
        planesData = data
        maxID = Object.keys(planesData).length - 1
        
    })
    .catch(reason => console.log(reason.message))

    fetchAsync('tags/')
    .then(data => {
        tagsData = data['tags']
        autocomplete(document.getElementById("tag_txt"),tagsData)
    })
    .catch(reason => console.log(reason.message))
}
function startRound(){
    CreateDeck()
    interactableStars = true
    document.getElementById("imageId").onclick= function(){nextPlane()}
    nextPlane()


}
function rollDice() {
    document.getElementById("diceResult").innerHTML = Math.floor(Math.random() * 6) + 1
}
function randomID(){
    rnd = Math.floor(Math.random() * (maxID))
    return rnd
}

// Functions
function nextPlane() {
    if(maxID > 0)
        fetchPlaneImage(randomID())
}
function fetchPlaneImage(ID){
    var plane = document.getElementById("imageId")
    plane.id="fade"
    plane.onclick =""

    document.getElementsByClassName("cardOverlay")[0].style.display = "none";
    currentCounter = 0;
    selectCounter(currentCounter)
    
    if (selected || tagsChanged) {
        evaluateCurrentPlane()
    }

    removeAllTagNodes()
    

    setTimeout(() => { 
        document.getElementById("fade").src = planesData[ID]['Image']
        currentPlane = planesData[ID]
        planesData[ID] = planesData[Object.keys(planesData).length - 1]
        delete planesData[Object.keys(planesData).length - 1]
        maxID = maxID - 1
        selected = false;

        currentPlane['Tags'].forEach(name => {
            createTagNode(name)
        });
        tagsChanged = false
    }, 500);
    setTimeout(() => { 
        plane.id="imageId"
        plane.onclick= function(){nextPlane()}

        const index = currentPlane['Tags'].indexOf("Planecounter");
        if (index > -1) { 
            document.getElementById("counter").style.display = "flex";
        }else{
            document.getElementById("counter").style.display = "none";
        }
        document.getElementsByClassName("cardOverlay")[0].style.display = "flex"
        selectStar((currentPlane['Rating'])[0],true)
        
    }, 1000);
        
        
}
function evaluateCurrentPlane(){

        if (!tagsChanged){
            delete currentPlane['Tags'] 
        }
        if( !selected){
            delete currentPlane['Rating'] 
        }
    
        let dataReceived = ""; 
        fetch("/plane", {
            credentials: "same-origin",
            mode: "same-origin",
            method: "put",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(currentPlane)
        })
            .then(resp => {
                if (resp.status === 200) {
                    return resp.json()
                } else {
                    console.log("Status: " + resp.status)
                    return Promise.reject("server")
                }
            })
            .then(dataJson => {
                dataReceived = JSON.parse(dataJson)
            })
            .catch(err => {
                if (err === "server") return
                console.log(err)
            })

}

// GET request
async function fetchAsync (url) {
    let response = await fetch(url);
    let data = await response.json();
    return data;
  }

// Overlay
function overlayOn() {
    document.getElementById("overlay").style.display = "flex";
  }
  
  function overlayOff(event) { 
    if ( event.target.id === 'overlay') {
        document.getElementById("overlay").style.display = "none";
    }
  } 
// Stars
function selectStar(amount, ignoreSelection){
    if(interactableStars){
        stars = document.getElementsByClassName("star")
        for (let index = 0; index < 5; index++) {
            if(index < amount){
                stars[index].classList.add("checked")
            }else{
                stars[index].classList.remove("checked")
            }
            
        }
        if(!ignoreSelection){
            selected = true;
            currentPlane['Rating'][2] = amount
            currentPlane['Rating'][1] = 1
        }
    }

}
// Counter
function selectCounter(amount){
    if(interactableCounter){
        counter = document.getElementsByClassName("counter")
        for (let index = 0; index < 10; index++) {
            if(index < amount){
                counter[index].classList.add("checkedCounter")
            }else{
                counter[index].classList.remove("checkedCounter")
            }
        }
        if(amount == 1 && currentCounter == 1){
            currentCounter = 0
            counter[0].classList.remove("checkedCounter")
        }else{
            currentCounter = amount
        }
    }

}
// Remove from local Planes
function RemoveEdition(editionName){
    console.log("Remove Edition " + editionName)
    var oldMaxID = maxID
    for (let key in planesData) {
        if(key in planesData){
            lastID = Object.keys(planesData).length - 1
            while(!(planesData[key] === undefined) && planesData[key]['Edition'] == editionName && lastID >= key){
                lastID = Object.keys(planesData).length - 1
                planesData[key] = planesData[lastID]
                delete planesData[lastID] 
                maxID -= 1
            }
        }
    }
    maxID = Object.keys(planesData).length - 1
    console.log("Removed " + (oldMaxID - maxID) + " Planes")
}
function RemoveHigherOrEqualRating(rating){
    for (let key in planesData) {
        if(key in planesData){
            lastID = Object.keys(planesData).length - 1
            while(!(planesData[key] === undefined) && planesData[key]['Rating'][0] >= rating && lastID >= key){
                lastID = Object.keys(planesData).length - 1
                planesData[key] = planesData[lastID]
                delete planesData[lastID] 
                maxID -= 1
            }
        }
    }
    maxID = Object.keys(planesData).length - 1
}
function RemoveLowerRatings(rating){
    console.log("Remove Planes with Rating lower than " + rating)
    var oldMaxID = maxID
    for (let key in planesData) {
        if(key in planesData){
            lastID = Object.keys(planesData).length - 1
            while(!(planesData[key] === undefined) && planesData[key]['Rating'][0] < rating && lastID >= key){
                lastID = Object.keys(planesData).length - 1
                planesData[key] = planesData[lastID]
                delete planesData[lastID] 
                maxID -= 1
            }
        }
    }
    maxID = Object.keys(planesData).length - 1
    console.log("Removed " + (oldMaxID - maxID) + " Planes")
}
function RemoveExactRating(rating){
    for (let key in planesData) {
        if(key in planesData){
            lastID = Object.keys(planesData).length - 1
            while(!(planesData[key] === undefined) && planesData[key]['Rating'][0] == rating && lastID >= key){
                lastID = Object.keys(planesData).length - 1
                planesData[key] = planesData[lastID]
                delete planesData[lastID] 
                maxID -= 1
            }
        }
    }
    maxID = Object.keys(planesData).length - 1
}
function KeepExactRating(rating){
    for (let key in planesData) {
        if(key in planesData){
            lastID = Object.keys(planesData).length - 1
            while(!(planesData[key] === undefined) && planesData[key]['Rating'][0] != rating && lastID >= key){
                lastID = Object.keys(planesData).length - 1
                planesData[key] = planesData[lastID]
                delete planesData[lastID] 
                maxID -= 1
            }
        }
    }
    maxID = Object.keys(planesData).length - 1
}
function CreateDeck(){
    // Remove Editions
    editions = document.getElementsByClassName("editioncheck")
    for (let index = 0; index < editions.length; index++) {
        if(!editions[index].checked){
            RemoveEdition(editions[index].value);
        }
    }
    // Remove by Rating
    RemoveLowerRatings(Number(document.getElementById("ratinginput").value))
}
//Autocomplete
function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
            b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                createTagItem(inp.value)
                inp.value = ""
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
  }
  // Tags
  function createTagItem(tagname){
    if(tagname in currentPlane['Tags']){
        console.log("Tag already in currentplane[Tags]");
    }else{
        currentPlane['Tags'].push(tagname)
        tagsChanged = true
        createTagNode(tagname)
    }
  }
  function createTagNode(tagname){
    const node = document.createElement("div")
    node.setAttribute("class", "tag option");
    node.setAttribute("id", "tag_" + tagname);
    node.innerHTML = tagname
    const button = document.createElement("input")
    button.setAttribute("type", "button");
    button.setAttribute("value", "X");
    button.setAttribute("onclick","removeTagItem('" + tagname + "')")
    node.appendChild(button)
    document.getElementById("tagarea").appendChild(node)

    if(tagname == "Planecounter"){
        document.getElementById("counter").style.display = "flex";
    }
  }
  function removeAllTagNodes(){
    var tagItems = document.getElementsByClassName("tag")
    while (tagItems.length > 0) {
        tagItems[0].remove()
     }
  }
  function removeTagItem(tagname){
    document.getElementById("tag_" + tagname).remove()
    if(tagname == "Planecounter"){
        document.getElementById("counter").style.display = "none";
    }

    const index = currentPlane['Tags'].indexOf(tagname);
    if (index > -1) { // only splice array when item is found
        currentPlane['Tags'].splice(index, 1); // 2nd parameter means remove one item only
        tagsChanged = true
    }
  }