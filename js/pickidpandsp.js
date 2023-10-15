//Sökfilter
function searchFilter() {
    var input, filter, ul, li, a, i, txtValue;
    input = document.getElementById("searchInput");
    filter = input.value.toUpperCase();
    div = document.getElementById("spList");
    a = div.getElementsByTagName("a");
    for (i = 0; i < a.length; i++) {
        p = a[i].getElementsByTagName("p")[0];
        txtValue = a.textContent || p.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            a[i].style.display = "";
        } else {
            a[i].style.display = "none";
        }
    }
}

//Läs in IdP-array från json
{
		fetch('https://fedfeeds.robertsundin.se/idp/json/multiidp.json')
            .then(function (idpResponse) {
                return idpResponse.json();
            })
            .then(function (idpData) {
                appendIdpData(idpData);
            })
            .catch(function (err) {
                console.log('error: ' + err);
            });
//Append json och nästla efterföljande script
        function appendIdpData(idpData) {
			
            for (let y = 0; y < idpData.length; y++) {
				let idpDisplayName = idpData[y].idpDisplayName
				let idpEntityId = idpData[y].idpEntityId
				let idpImg = idpData[y].idpImg
				
//Skapa lista och infoga på sida
const dFragIdp = document.createDocumentFragment();
				
const opt = document.createElement('option');
  opt.textContent = idpDisplayName;
  opt.value = idpEntityId;
  
  dFragIdp.appendChild(opt);
  
  document.getElementById("idpSelect").appendChild(dFragIdp);
  
}}

//kolla om cardStyle är valt annars sätt default full
if (localStorage.getItem("cardStyle") == null) {
	localStorage.setItem("cardStyle","full");
  }
//Sätt variabel som används för att välja css för utseende på korten
let cardStyling=localStorage.getItem("cardStyle");

//Kolla om det redan finns en vald IdP sen tidigare
if (localStorage.getItem("idpOrgEntity") !== null) {
	document.getElementById("idpSelectDiv").style.display = "none";
  } else {
    document.getElementById("spList").style.display = "none";
	document.getElementById("idpSelectDiv").style.display = "block";
	document.getElementById("selectIdpHeading").innerHTML="Innan du kan använda portalen så måste du välja inloggning";
  }
  

//Sätt vald entityID som variabel - eller localStore i ny kod
 function updateIdp() {
  let userPickedIdp = document.getElementById("idpSelect").value;
  localStorage.setItem("idpOrgEntity",userPickedIdp);
  


// sätt text från selected option som variabel
const pickedIdpDisplay = (el) => {
  if (el.selectedIndex === -1) {
    return null;
  }
  return el.options[el.selectedIndex].text;
}
const select = document.querySelector('select')
const text = pickedIdpDisplay(select);
localStorage.setItem("idpOrgName",text);
  
  location.reload();

 }
  
  const pickedIdp = localStorage.getItem("idpOrgEntity");


// infoga text för vald option i dokumentet

if (localStorage.getItem("idpOrgEntity") !== null) {
	document.getElementById("show").innerHTML = localStorage.getItem("idpOrgName");
  } else {
    document.getElementById("show").innerHTML = "Federationsportalen";
  }

 	
//Läs in SP-array från json
		fetch('https://fedfeeds.robertsundin.se/sp/json/splink.json')
            .then(function (spResponse) {
                return spResponse.json();
            })
            .then(function (spData) {
                appendSpData(spData);
            })
            .catch(function (err) {
                console.log('error: ' + err);
            });
//Append json och nästla efterföljande script
        function appendSpData(spData) {
			
            for (let x = 0; x < spData.length; x++) {
				let concLink = spData[x].spLink + pickedIdp + spData[x].spTarget;
				let spDisplayName = spData[x].spDisplayName
				let spImg = spData[x].spImg
				let spShortDescription = spData[x].shortDescription
				let spDescription = spData[x].description
				
//Skapa lista och infoga på sida
const dFrag = document.createDocumentFragment();

  const a = document.createElement('a');
  a.className = "flex-"+cardStyling+"item";
  a.setAttribute('href', concLink);
  a.target = "_blank";
  const img = document.createElement('img');
  img.className = "flex-"+cardStyling+"item-img";
  img.setAttribute('src', spImg);
  const p = document.createElement('p');
  p.className = "flex-"+cardStyling+"item-txt";
  p.innerHTML = spDisplayName;
  const pOrg = document.createElement('p');
  pOrg.className = "flex-item-org";
  pOrg.innerHTML = spShortDescription;
  const pDescription = document.createElement('p');
  pDescription.innerHTML = spDescription;
  pDescription.className = "flex-item-description";
  

  dFrag.appendChild(a);
  a.appendChild(img);
  a.appendChild(p);
if (localStorage.getItem("cardStyle")=="full"){
  a.appendChild(pOrg);
  a.appendChild(pDescription);
}

  document.getElementById('spList').appendChild(dFrag);
  
 
			}}}

//Visa och dölj inställningar - toggla knappen
function settings() {
  var x = document.getElementById("settings");
  if (x.style.display === "none") {
    x.style.display = "flex";
  } else {
    x.style.display = "none";
	document.getElementById("idpSelectDiv").style.display="none";
  }
}

// Visa IdP-val för att kunna välja ny IdP
function newIdp() {
  var x = document.getElementById("idpSelectDiv");
  if (x.style.display === "none") {
    x.style.display = "block";
	document.getElementById("selectIdpHeading").innerHTML="Välj en ny inloggning eller gå tillbaka till portalen";
	document.getElementById("currentIdp").innerHTML="Nuvarande val är: "+localStorage.getItem("idpOrgName");
	document.getElementById("backToPortal").style.display="";
  } else {
    x.style.display = "none";
	
  }
}

//Visa card style settings
function cardStyleSettings() {
  var x = document.getElementById("cardStyle");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
	
  }
}

//Skriv vald card style till local storage
function cardStyleSubmit() {
    var ele = document.getElementsByName('cardStyle');
    for (i = 0; i < ele.length; i++) {
    if (ele[i].checked)
        localStorage.setItem("cardStyle", ele[i].value);
	    location.reload();
            }
        }



//Tillbaka till portal från settings-sida
function backToPortal() {
	document.getElementById("idpSelectDiv").style.display="none";
	document.getElementById("settings").style.display="none";
	document.getElementById("cardStyle").style.display="none";
}





/*Visa alert box och ladda därefter om dokumentet vid "välj en annan organisation"
function reload() {
  alert("Du kommer nu att kunna göra om ditt val av organisation, men tänk på att om du redan har loggat in i en tjänst så kommer tjänsten att komma ihåg den inloggningen. Du kan därför behöva stänga webbläsaren och öppna portalen igen.");
  location.reload();
}
*/
