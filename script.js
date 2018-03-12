var dataSet = [];
var dataLoaded = false;
var isError = false;
var searchEl;
var searchQuery;
var sortEl;
var listUl;
var sortOrderEl;

//initialize the data fetch call and attach event listeners
function init() {
    attachListeners();
    fetchData();
}

//call server to get the hacker news data
function fetchData() {
    //If data present at localstorage
    var localData = JSON.parse(localStorage.getItem('hackerNewsData'));
    if(localData) {
        dataLoaded = true;
        isError = false;
        dataSet = localData['data'];
        createList();
    } else {
        fetch("http://starlord.hackerearth.com/hackernews")
            .then(res => res.json())
            .then(
                (result) => {
                    dataLoaded = true;
                    isError = false;
                    result.splice(0,1);
                    dataSet = result;
                    createList();
                    localStorage.setItem('hackerNewsData', JSON.stringify({data: dataSet}));
                },
                (error) => {
                    dataLoaded = false;
                    isError = true;
                    showError();
                }
            )
    }
}

//attach event listeners for filtering and sorting
function attachListeners() {
    searchEl = document.getElementById('searchInput');
    var timeout = null;
    searchEl.onkeyup = function (e) {
        clearTimeout(timeout);
        timeout = setTimeout(function (e) {
            filterDataList();
        }, 100);
    };

    sortEl = document.getElementById('sortById');
    sortEl.onchange = function (e) {
        sortDataList();
    }

    sortOrderEl = document.getElementById('sortByOrder');
    sortOrderEl.onchange = function (e) {
        sortDataList();
    }
}

//handler to sort data
function sortDataList() {
    if(sortEl.value && sortEl.value !== '') {
        var data = getSortedData(sortEl.value, sortOrderEl.checked);
        cleanUpUlDom();
        createListElements(data, listUl);
    }
}

//remove all the list element before sorting as DOM manipulation is costly than data manipulation and rebuilding DOM
function cleanUpUlDom() {
    listUl.innerHTML = '';
}

//return sorted data based on the sortBy field and the sortOrder asd or desc
function getSortedData(field, descOrder) {
    var type = sortEl.selectedOptions[0].getAttribute('data-type');
    var data = dataSet;
    data.sort(function(a, b){
        if(type === 'number') {
            return (descOrder ? b[field] - a[field] : a[field] - b[field]);
        } else if(type === 'string') {
            return (descOrder ? b[field].toLocaleLowerCase().localeCompare(a [field].toLocaleLowerCase()) : a[field].toLocaleLowerCase().localeCompare(b [field].toLocaleLowerCase()));
        } else if(type === 'date') {
            return (descOrder ? new Date(b[field]) - new Date(a[field]) : new Date(a[field]) - new Date(b[field]));
        }
    });
    return data;
}

//filter the data set based on search query
function filterDataList() {
    searchQuery = searchEl.value.trim().toLowerCase();
    var listEls = document.getElementsByTagName('li');
    for (var i = 0; i < listEls.length; i++) {
        var title = listEls[i].getElementsByClassName('dataTitleLink')[0].innerHTML;
        if (title.toLowerCase().indexOf(searchQuery) < 0)
            listEls[i].style.display = 'none';
        else
            listEls[i].style.display = 'block';
    }
}

//create an unordered list and call method to create li items
function createList() {
    var mainContainerDiv = document.getElementById('mainDivId');
    listUl = document.createElement('ul');
    mainContainerDiv.appendChild(listUl);
    createListElements(dataSet, listUl);

}

//create li items based on the dataItems
function createListElements(dataItems, list) {
    var listEl;
    for(var i = 0; i < dataItems.length; i++) {
        listEl = document.createElement('li');
        listEl.innerHTML = buildInnerHTML(dataItems[i]);
        list.appendChild(listEl);
    }
}

//build innerHTML for li items
function buildInnerHTML(dataItem) {
    var htmlString = "<div>" +
                        "<a class='dataTitleLink' href='"+ dataItem.url+"' target='_blank'>"+dataItem.title+"</a>"+
                    "</div>" +
                    "<div>" +
                        "Created at: "+dataItem['created_at']+"  |  "+dataItem['num_points']+" points by "+dataItem.author+"  |  "+dataItem['num_comments']+" comments"+
                    "</div>";

    return htmlString;
}

function showError() {
    var errorEl = document.getElementById('errorId');
    errorEl.style.display = 'block';
}