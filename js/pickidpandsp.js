// Refactored PickIdpAndSp script

// Configuration
const CONFIG = {
    urls: {
        idp: 'https://fedfeeds.robertsundin.se/idp/json/multiidp.json',
        sp: 'https://fedfeeds.robertsundin.se/sp/json/splink.json'
    },
    selectors: {
        idpSelectDiv: 'idpSelectDiv',
        spList: 'spList',
        selectIdpHeading: 'selectIdpHeading',
        idpSelect: 'idpSelect',
        idpSelectOpt: 'idpSelectOpt',
        currentIdp: 'currentIdp',
        backToPortal: '.js-back-to-portal',
        showHeader: 'show',
        spFilterList: 'spFilterList',
        spFilterDiv: 'spFilterDiv',
        cardStyleDiv: 'cardStyle',
        customUrlDiv: 'customUrlDiv',
        settingsDiv: 'settings',
        searchInput: 'searchInput',
        showSavedUrls: 'showSavedUrls',
        custUrlHeading: 'custUrlHeading',
        custUrlList: 'custUrlList',
        custNameInput: 'custName',
        custUrlInput: 'custUrl',
        btnCardStyleSubmit: 'btnCardStyleSubmit',
        btnSaveViewMode: 'btnSaveViewMode',
        btnAddCustomUrl: 'btnAddCustomUrl',
        btnSettings: 'btnSettings',
        newIdp: 'newIdp',
        btnSpFilterSettings: 'btnSpFilterSettings',
        cardStyleSettings: 'cardStyleSettings',
        customUrlSettings: 'customUrlSettings',
        clearAll: 'clearAll',
        themeToggle: 'themeToggle'
    },
    storageKeys: {
        idpOrgEntity: 'idpOrgEntity',
        idpOrgName: 'idpOrgName',
        cardStyle: 'cardStyle',
        pickedServices: 'pickedServices',
        savedUrls: 'savedUrls',
        theme: 'theme',
        viewMode: 'viewMode'
    }
};

// State
let state = {
    pickedIdp: null,
    cardStyling: 'full',
    customUrlArray: [],
    spFilterSelected: [], // Favorites list (SP names)
    theme: 'auto',
    viewMode: 'all',
    spData: [] // Store fetched SP data
};

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    loadState();
    applyTheme(state.theme);
    setupEventListeners();
    checkInitialView();
    updateHeader();

    try {
        await loadIdpData();
        await loadSpData();
    } catch (error) {
        console.error('Error loading data:', error);
    }

    // Load custom URLs after everything else
    loadCustomUrls();
}

function loadState() {
    state.pickedIdp = localStorage.getItem(CONFIG.storageKeys.idpOrgEntity);
    state.cardStyling = getCardStyle();

    const savedUrls = localStorage.getItem(CONFIG.storageKeys.savedUrls);
    state.customUrlArray = savedUrls ? JSON.parse(savedUrls) : [];

    const pickedServices = localStorage.getItem(CONFIG.storageKeys.pickedServices);
    state.spFilterSelected = pickedServices ? JSON.parse(pickedServices) : [];

    const theme = localStorage.getItem(CONFIG.storageKeys.theme);
    state.theme = theme || 'auto';

    const viewMode = localStorage.getItem(CONFIG.storageKeys.viewMode);
    state.viewMode = viewMode || 'all';
}

function setupEventListeners() {
    const idpSelect = document.getElementById(CONFIG.selectors.idpSelect);
    if (idpSelect) {
        idpSelect.addEventListener('change', updateIdp);
    }

    const backButtons = document.querySelectorAll(CONFIG.selectors.backToPortal);
    backButtons.forEach(btn => {
        btn.addEventListener('click', backToPortal);
    });

    const btnCardStyleSubmit = document.getElementById(CONFIG.selectors.btnCardStyleSubmit);
    if (btnCardStyleSubmit) {
        btnCardStyleSubmit.addEventListener('click', cardStyleSubmit);
    }

    const btnSaveViewMode = document.getElementById(CONFIG.selectors.btnSaveViewMode);
    if (btnSaveViewMode) {
        btnSaveViewMode.addEventListener('click', saveViewMode);
    }

    const btnAddCustomUrl = document.getElementById(CONFIG.selectors.btnAddCustomUrl);
    if (btnAddCustomUrl) {
        btnAddCustomUrl.addEventListener('click', addCustomUrl);
    }

    const searchInput = document.getElementById(CONFIG.selectors.searchInput);
    if (searchInput) {
        searchInput.addEventListener('keyup', searchFilter);
    }

    const btnSettings = document.getElementById(CONFIG.selectors.btnSettings);
    if (btnSettings) {
        btnSettings.addEventListener('click', toggleSettings);
    }

    const btnNewIdp = document.getElementById(CONFIG.selectors.newIdp);
    if (btnNewIdp) {
        btnNewIdp.addEventListener('click', showNewIdpSelection);
    }

    const btnSpFilterSettings = document.getElementById(CONFIG.selectors.btnSpFilterSettings);
    if (btnSpFilterSettings) {
        btnSpFilterSettings.addEventListener('click', showSpFilterSettings);
    }

    const btnCardStyleSettings = document.getElementById(CONFIG.selectors.cardStyleSettings);
    if (btnCardStyleSettings) {
        btnCardStyleSettings.addEventListener('click', showCardStyleSettings);
    }

    const btnCustomUrlSettings = document.getElementById(CONFIG.selectors.customUrlSettings);
    if (btnCustomUrlSettings) {
        btnCustomUrlSettings.addEventListener('click', showCustomUrlSettings);
    }

    const btnClearAll = document.getElementById(CONFIG.selectors.clearAll);
    if (btnClearAll) {
        btnClearAll.addEventListener('click', clearAllSettings);
    }

    const themeToggle = document.getElementById(CONFIG.selectors.themeToggle);
    if (themeToggle) {
        themeToggle.addEventListener('click', cycleTheme);
    }
}

// Theme Handling
function cycleTheme() {
    if (state.theme === 'auto') state.theme = 'dark';
    else if (state.theme === 'dark') state.theme = 'light';
    else state.theme = 'auto';

    localStorage.setItem(CONFIG.storageKeys.theme, state.theme);
    applyTheme(state.theme);
}

function applyTheme(theme) {
    if (theme === 'auto') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', theme);
    }
}

// Helper: Get Card Style
function getCardStyle() {
    let style = localStorage.getItem(CONFIG.storageKeys.cardStyle);
    if (!style) {
        style = 'full';
        localStorage.setItem(CONFIG.storageKeys.cardStyle, style);
    }
    return style;
}

function checkInitialView() {
    const idpSelectDiv = document.getElementById(CONFIG.selectors.idpSelectDiv);
    const spList = document.getElementById(CONFIG.selectors.spList);
    const selectIdpHeading = document.getElementById(CONFIG.selectors.selectIdpHeading);

    if (state.pickedIdp) {
        if (idpSelectDiv) idpSelectDiv.style.display = 'none';
    } else {
        if (spList) spList.style.display = 'none';
        if (idpSelectDiv) idpSelectDiv.style.display = 'block';
        if (selectIdpHeading) selectIdpHeading.innerHTML = "Innan du kan använda portalen så måste du välja inloggning";
    }
}

function updateHeader() {
    const showHeader = document.getElementById(CONFIG.selectors.showHeader);
    const idpName = localStorage.getItem(CONFIG.storageKeys.idpOrgName);
    if (showHeader) {
        showHeader.innerHTML = idpName || "Federationsportalen";
    }
}

async function loadIdpData() {
    const response = await fetch(CONFIG.urls.idp);
    const data = await response.json();
    appendIdpData(data);
}

function appendIdpData(idpData) {
    const idpSelect = document.getElementById(CONFIG.selectors.idpSelect);
    if (!idpSelect) return;

    const dFragIdp = document.createDocumentFragment();

    idpData.forEach(idp => {
        const opt = document.createElement('option');
        opt.textContent = idp.idpDisplayName;
        opt.value = idp.idpEntityId;
        dFragIdp.appendChild(opt);
    });

    idpSelect.appendChild(dFragIdp);
}

function updateIdp() {
    const idpSelect = document.getElementById(CONFIG.selectors.idpSelect);
    const userPickedIdp = idpSelect.value;

    if (!userPickedIdp) return;

    localStorage.setItem(CONFIG.storageKeys.idpOrgEntity, userPickedIdp);

    const selectedText = idpSelect.options[idpSelect.selectedIndex].text;
    localStorage.setItem(CONFIG.storageKeys.idpOrgName, selectedText);

    location.reload();
}

async function loadSpData() {
    const response = await fetch(CONFIG.urls.sp);
    const data = await response.json();

    // Store in state
    state.spData = data;

    renderSpCards();
}

// Renamed from appendSpData to renderSpCards (uses state.spData)
function renderSpCards() {
    const spList = document.getElementById(CONFIG.selectors.spList);
    if (!spList) return;

    spList.innerHTML = '';

    // 1. Filter based on View Mode
    let result = [...state.spData]; // Clone array
    if (state.viewMode === 'favorites') {
        result = result.filter(sp => state.spFilterSelected.includes(sp.spDisplayName));
    }

    // 2. Sort: Favorites first, then Name
    result.sort((a, b) => {
        const aFav = state.spFilterSelected.includes(a.spDisplayName);
        const bFav = state.spFilterSelected.includes(b.spDisplayName);

        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;

        return a.spDisplayName.localeCompare(b.spDisplayName);
    });

    const dFrag = document.createDocumentFragment();

    result.forEach(sp => {
        const concLink = sp.spLink + (state.pickedIdp || '') + sp.spTarget;
        const isFav = state.spFilterSelected.includes(sp.spDisplayName);

        const a = document.createElement('a');
        a.className = "flex-" + state.cardStyling + "item";
        a.setAttribute('href', concLink);
        a.target = "_blank";

        // Star Icon
        const star = document.createElement('span');
        star.className = isFav ? "star-icon active" : "star-icon inactive";
        star.title = isFav ? "Ta bort favorit" : "Lägg till favorit";
        star.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSpFavorite(sp.spDisplayName, star);
        });
        a.appendChild(star);

        const img = document.createElement('img');
        img.className = "flex-" + state.cardStyling + "item-img";
        img.setAttribute('src', sp.spImg);
        a.appendChild(img);

        // Wrap text elements for layout
        const textWrapper = document.createElement('div');
        textWrapper.className = "card-text-wrapper";

        const p = document.createElement('p');
        p.className = "flex-" + state.cardStyling + "item-txt";
        p.innerHTML = sp.spDisplayName;
        textWrapper.appendChild(p);

        if (state.cardStyling === 'full') {
            const pOrg = document.createElement('p');
            pOrg.className = "flex-item-org";
            pOrg.innerHTML = sp.shortDescription;
            textWrapper.appendChild(pOrg);

            const pDescription = document.createElement('p');
            pDescription.innerHTML = sp.description;
            pDescription.className = "flex-item-description";
            textWrapper.appendChild(pDescription);
        }

        a.appendChild(textWrapper);
        dFrag.appendChild(a);
    });

    spList.appendChild(dFrag);

    // Re-apply search filter if search input has value
    const searchInput = document.getElementById(CONFIG.selectors.searchInput);
    if (searchInput && searchInput.value) {
        searchFilter();
    }
}

function toggleSpFavorite(spName, starElement) {
    const idx = state.spFilterSelected.indexOf(spName);
    if (idx > -1) {
        state.spFilterSelected.splice(idx, 1);
        // starElement.className = "star-icon inactive"; // No longer needed as we re-render
    } else {
        state.spFilterSelected.push(spName);
        // starElement.className = "star-icon active";
    }
    localStorage.setItem(CONFIG.storageKeys.pickedServices, JSON.stringify(state.spFilterSelected));

    // Immediate Re-render to sort
    renderSpCards();
}

function loadCustomUrls() {
    if (state.customUrlArray.length > 0) {
        showCustUrls();
        insertCustUrls();
    } else {
        const custUrlHeading = document.getElementById(CONFIG.selectors.custUrlHeading);
        if (custUrlHeading) custUrlHeading.innerHTML = "";
    }
}

function addCustomUrl() {
    const custNameInput = document.getElementById(CONFIG.selectors.custNameInput);
    const custUrlInput = document.getElementById(CONFIG.selectors.custUrlInput);

    if (!custNameInput || !custUrlInput) return;

    const customUrlObject = {
        custName: custNameInput.value,
        custUrl: custUrlInput.value,
        isFavorite: false
    };

    state.customUrlArray.push(customUrlObject);
    localStorage.setItem(CONFIG.storageKeys.savedUrls, JSON.stringify(state.customUrlArray));

    showCustUrls();
    insertCustUrls();
}

function showCustUrls() {
    const showSavedUrls = document.getElementById(CONFIG.selectors.showSavedUrls);
    if (!showSavedUrls) return;

    showSavedUrls.innerHTML = "";

    state.customUrlArray.forEach((urlObj, index) => {
        const custUrlRow = document.createElement('tr');

        const custUrlNameTd = document.createElement('td');
        custUrlNameTd.innerText = urlObj.custName;

        const custUrlLinkTd = document.createElement('td');
        custUrlLinkTd.innerHTML = urlObj.custUrl;

        const custUrlButtonTd = document.createElement('td');
        const custUrlRemBut = document.createElement('button');
        custUrlRemBut.innerHTML = "Ta bort";
        custUrlRemBut.className = "button secondary";
        custUrlRemBut.addEventListener('click', () => remCustUrl(index));

        custUrlButtonTd.appendChild(custUrlRemBut);

        custUrlRow.appendChild(custUrlNameTd);
        custUrlRow.appendChild(custUrlLinkTd);
        custUrlRow.appendChild(custUrlButtonTd);

        showSavedUrls.appendChild(custUrlRow);
    });
}

function remCustUrl(index) {
    state.customUrlArray.splice(index, 1);
    localStorage.setItem(CONFIG.storageKeys.savedUrls, JSON.stringify(state.customUrlArray));
    showCustUrls();
    insertCustUrls();
}

function insertCustUrls() {
    const custUrlHeading = document.getElementById(CONFIG.selectors.custUrlHeading);

    let displayArray = [...state.customUrlArray]; // clone
    if (state.viewMode === 'favorites') {
        displayArray = displayArray.filter(u => u.isFavorite);
    }

    displayArray.sort((a, b) => {
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return 0;
    });

    if (custUrlHeading) {
        if (displayArray.length > 0) {
            custUrlHeading.innerHTML = "Egna länkar";
            custUrlHeading.style.display = 'block';
        } else {
             custUrlHeading.innerHTML = "";
             custUrlHeading.style.display = 'none';
        }
    }

    const custUrlList = document.getElementById(CONFIG.selectors.custUrlList);
    if (!custUrlList) return;

    custUrlList.innerHTML = "";

    displayArray.forEach(urlObj => {
        const custUrlA = document.createElement("a");
        custUrlA.className = "flex-miniitem";
        custUrlA.setAttribute('href', urlObj.custUrl);
        custUrlA.target = "_blank";

        const star = document.createElement('span');
        star.className = urlObj.isFavorite ? "star-icon active" : "star-icon inactive";
        star.title = urlObj.isFavorite ? "Ta bort favorit" : "Lägg till favorit";
        star.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleCustomFavorite(urlObj, star);
        });
        custUrlA.appendChild(star);

        const img = document.createElement('img');
        img.className = "flex-miniitem-img";
        img.setAttribute('src', "img/custurl.png");
        custUrlA.appendChild(img);

        // Wrap text for consistency if needed, though miniitem style might differ
        // Keeping miniitem simple for now, but star is added.
        const custUrlName = document.createElement("p");
        custUrlName.className = "flex-miniitem-txt";
        custUrlName.innerHTML = urlObj.custName;
        custUrlA.appendChild(custUrlName);

        custUrlList.appendChild(custUrlA);
    });
}

function toggleCustomFavorite(urlObj, starElement) {
    urlObj.isFavorite = !urlObj.isFavorite;
    localStorage.setItem(CONFIG.storageKeys.savedUrls, JSON.stringify(state.customUrlArray));

    // Immediate Re-render
    insertCustUrls();
}

// User Actions
function toggleSettings() {
    const settingsDiv = document.getElementById(CONFIG.selectors.settingsDiv);
    const idpSelectDiv = document.getElementById(CONFIG.selectors.idpSelectDiv);

    if (settingsDiv.style.display === "none") {
        settingsDiv.style.display = "block";
    } else {
        settingsDiv.style.display = "none";
        if (idpSelectDiv) idpSelectDiv.style.display = "none";
    }
}

function showNewIdpSelection() {
    const idpSelectDiv = document.getElementById(CONFIG.selectors.idpSelectDiv);
    if (idpSelectDiv.style.display === "none") {
        idpSelectDiv.style.display = "block";
        document.getElementById(CONFIG.selectors.selectIdpHeading).innerHTML = "Välj en ny inloggning";
        document.getElementById(CONFIG.selectors.idpSelectOpt).innerHTML = "Byt inloggning";
        document.getElementById(CONFIG.selectors.currentIdp).innerHTML = "Nuvarande val: " + localStorage.getItem(CONFIG.storageKeys.idpOrgName);

        const backBtns = document.querySelectorAll(CONFIG.selectors.backToPortal);
        backBtns.forEach(btn => btn.style.display = "");

        document.getElementById(CONFIG.selectors.settingsDiv).style.display = "none";

        alert("Du kommer nu att kunna göra om ditt val av organisation. Tänk på att om du redan loggat in i en tjänst kan sessionen finnas kvar.");
    } else {
        idpSelectDiv.style.display = "none";
    }
}

function showCardStyleSettings() {
    const el = document.getElementById(CONFIG.selectors.cardStyleDiv);
    document.getElementById(CONFIG.selectors.settingsDiv).style.display = "none";
    el.style.display = "block";
}

function cardStyleSubmit() {
    const radios = document.getElementsByName('cardStyle');
    for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            localStorage.setItem(CONFIG.storageKeys.cardStyle, radios[i].value);
            location.reload();
        }
    }
}

function showSpFilterSettings() {
    const el = document.getElementById(CONFIG.selectors.spFilterDiv);
    document.getElementById(CONFIG.selectors.settingsDiv).style.display = "none";

    if (el.style.display === "none") {
        el.style.display = "block";

        const radios = document.getElementsByName('viewMode');
        for (let i = 0; i < radios.length; i++) {
            if (radios[i].value === state.viewMode) {
                radios[i].checked = true;
            }
        }
    } else {
        el.style.display = "none";
    }
}

function showCustomUrlSettings() {
    const el = document.getElementById(CONFIG.selectors.customUrlDiv);
    document.getElementById(CONFIG.selectors.settingsDiv).style.display = "none";
    el.style.display = "block";
}

function saveViewMode() {
    const radios = document.getElementsByName('viewMode');
    let selectedMode = 'all';
    for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            selectedMode = radios[i].value;
        }
    }

    state.viewMode = selectedMode;
    localStorage.setItem(CONFIG.storageKeys.viewMode, selectedMode);

    document.getElementById(CONFIG.selectors.spFilterDiv).style.display = "none";
    document.getElementById(CONFIG.selectors.settingsDiv).style.display = "none";

    location.reload();
}

function backToPortal() {
    const divs = [
        CONFIG.selectors.idpSelectDiv,
        CONFIG.selectors.settingsDiv,
        CONFIG.selectors.cardStyleDiv,
        CONFIG.selectors.spFilterDiv,
        CONFIG.selectors.customUrlDiv
    ];

    divs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });
}

function clearAllSettings() {
    if (confirm('Är du säker på att du vill rensa alla inställningar?')) {
        localStorage.clear();
        location.reload();
    }
}

function searchFilter() {
    const input = document.getElementById(CONFIG.selectors.searchInput);
    const filter = input.value.toUpperCase();
    const div = document.getElementById(CONFIG.selectors.spList);
    const a = div.getElementsByTagName("a");

    for (let i = 0; i < a.length; i++) {
        const p = a[i].getElementsByTagName("p")[0];
        const txtValue = a[i].textContent || p.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            a[i].style.display = "";
        } else {
            a[i].style.display = "none";
        }
    }
}
