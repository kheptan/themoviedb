/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var movieLink = "";
var API_KEY = "c519e3f6f2dfc476ebbd691e194cc1e8";
var API_KEY_STRING = "?api_key=" + API_KEY; 
var SEARCH_MOVIE = "/search/movie";
var DISCOVER_MOVIE = "/discover/movie";
var SEARCH_PERSON = "/search/person";
var MOVIE_LIST = "/genre/movie/list";
var MOVIE_ID = "/movie/";
var ACTOR_ID = "/person/";
var API_CONFIG = "/configuration";
var APPEND_TO_RESPONSE = "&append_to_response=";
var THE_MOVIE_DB = "https://api.themoviedb.org/3";

/**/
var isMovie = true;
var isActor = false;
var errorThrow="";

var BaseConfig = {};

var SortByVal= [ 
    "popularity.",
    "primary_release_date.",
    "original_title.",
    "vote_average."      
];
var SortByNames=[
    "Popularity",
    "Release Date",
    "Title",
    "Best Of"
];


function toggleRadio() {
    var radio1 = $("#radioAsc");
    var radio2 = $("#radioDesc");
    var selected="";
    
    radio1.click(function(){
          $(this).prop( "checked", true );
          radio2.prop( "checked", false);        
    });
    radio2.click(function(){
          $(this).prop( "checked", true );
          radio1.prop( "checked", false);        
    });
    
    if ($(radio1).is(":checked")) {
        selected = radio1.val();
    }else {
        selected = radio2.val();
    }
    return selected;
    
}

function drawSortInputs(){
    var selectSortByInput=$("#sortbyFilter");    
    for(var i=0; i<4; i++){        
        selectSortByInput.append("<option value=\""+SortByVal[i]+"\">"+SortByNames[i]+"</option>");
    }
   
}

/* Movie Object Class Prototype    */
function MovieDetails(title, overview, poster) {
    this.movieTitle = title;
    this.movieOverview = overview;
    this.moviePoster = poster;
}

/* Search Meta Object Class Prototype  */
function SearchMeta(genres, year, filter, ascdesc) {    
    this.mvGenres = genres;
    this.mvYear = year;
    this.mvFilter = filter;
    this.mvAscDesc = ascdesc;
}
/* 
 *  Get global variables 
 */ 
function getConfig(){
    $.ajax({
        url: THE_MOVIE_DB+API_CONFIG+API_KEY_STRING,
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
        }
    }).done(function( data ) {
        BaseConfig.base_url = data.images.base_url;
        BaseConfig.poster_size = data.images.poster_sizes[1];
    }).fail( function (){
        alert("Failed loading movieDb configuration!!");
    });    
}

function discoverMovie(p){      
      clearDetails();
      showBodyLoading();
      var query= {};  
      query.with_genres = p.mvGenres;
      query.primary_release_year = parseInt(p.mvYear);
      query.sort_by=p.mvFilter.concat(p.mvAscDesc);
      
      $.ajax({
          url : THE_MOVIE_DB+DISCOVER_MOVIE+API_KEY_STRING+"&language=en-US",
          data : query
      }).done(function(data){
          //show movie list
          showMovieList(data);
          hideBodyLoading();
      }).fail(function(){
          alert("Fail loading movies data...!!!");
          //impl error handler
      });
      
}
/*
 * Concept propriu de paginare 100% :) 
 */
function pagination(data){          
    // total number of pages
    totalpages = data['total_pages'];
    
    startPage=0;    
    firstpage=1;        
      
    //get current page from data object
    curentPage=data['page'];    
        
    var pagElement = $(".pagination");     
    pagElement.html("");   
         
    if ( curentPage >= (firstpage + 4) && curentPage <= (totalpages - 4 )) {
        /* 
         *   In between tab values  - contains 5 elements
         */         
        insertHtml = "<ul>"; 
        insertHtml+="<li data-page=\"1\">First</li><li data-page=\""+(curentPage -1)+"\">Back</li>";
        insertHtml+="<li data-page=\"1\">1</li><li class=\"disabled\">...</li>";
        
        for (var i=0; i<5; i++) {
            if (curentPage ===((curentPage-2)+i) ) {
                insertHtml+="<li class=\"active\" data-page=\""+curentPage+"\">"+curentPage+"</li>";
                    continue;
            }
            insertHtml+="<li class=\"default\" data-page=\""+((curentPage-2)+i)+"\">"+((curentPage-2)+i)+"</li>";
        }
        insertHtml+="<li class=\"disabled\">...</li><li data-page=\""+totalpages+"\">"+totalpages+"</li>";
        insertHtml+="<li data-page=\""+(curentPage+1)+"\">Next</li><li data-page=\""+totalpages+"\">Last</li></ul>";
        pagElement.html(insertHtml);             
        insertHtml ="";
        
    } else if (curentPage < (firstpage + 4) && totalpages > 5) {
            /*
             *  beggind of pagination
             *  add 2 elements on each increase 
             *  disable Back button if on page==1
             */
            var counter=2;
            var dot="<li class=\"disabled\">...</li>";
            
            insertHtml = "<ul>";           
            if ( curentPage === 1 ) { 
                insertHtml+="<li class=\"disabled\">First</li><li class=\"disabled\">Back</li>";                
            } else {
                insertHtml+="<li data-page=\"1\">First</li><li data-page=\""+(curentPage -1)+"\">Back</li>";             
            }
            if((totalpages - curentPage)===3) {
                counter=2;
                dot="";
            }else if ((totalpages - curentPage)===2) {
                counter=1;
                dot=""; 
            }
            for ( var i=1; i<=(curentPage + counter); i++ ) {
                if ( i === curentPage ) {
                    insertHtml+="<li class=\"active\" data-page=\""+i+"\">"+i+"</li>";
                    continue;
                }                
                insertHtml+="<li class=\"default\" data-page=\""+i+"\">"+i+"</li>";
            }
            insertHtml += dot;
            insertHtml +="<li \n\
                          class=\"default\" data-page=\""+totalpages+"\">\n\
                          "+totalpages+"</li><li class=\"default\" \n\
                          data-page=\""+(curentPage +1 )+"\">Next</li>\n\
                          <li class=\"default\" data-page=\""+totalpages+"\">\n\
                          Last</li></ul>";
            pagElement.html(insertHtml);             
            insertHtml ="";
        
      } else if(totalpages <= 5 ){                   
                    insertHtml = "<ul>";           
                    if ( curentPage === 1 ) { 
                        insertHtml+="<li class=\"disabled\">First</li><li class=\"disabled\">Back</li>";                
                    } else {
                        insertHtml+="<li data-page=\"1\">First</li><li data-page=\""+(curentPage -1)+"\">Back</li>";             
                    }
                    for ( var i=1; i<=totalpages; i++ ) {
                            if ( i === curentPage ) {
                                insertHtml+="<li class=\"active\" data-page=\""+i+"\">"+i+"</li>";
                                continue;
                            }
                            
                            insertHtml+="<li class=\"default\" data-page=\""+i+"\">"+i+"</li>";
                    }
                    if ( curentPage === totalpages  ) { 
                         insertHtml+="<li class=\"disabled\">Next</li><li class=\"disabled\">Last</li>";                                      
                      } else {                
                         insertHtml+="<li data-page=\""+(curentPage+1)+"\">Next</li><li data-page=\""+totalpages+"\">Last</li>";             
                      }
                    pagElement.html(insertHtml);             
                    insertHtml ="";                      
             } else{
                    /**
                     * end of pagination
                     *  (P(t) - curentPage) +3  - nr of elements
                     *  disable Next button if reach to the last element
                     */   
                     
                     insertHtml = "<ul>"; 
                     insertHtml+="<li data-page=\"1\" class=\"default\">First</li>\n\
                            <li data-page=\""+(curentPage -1)+"\" \n\
                            class=\"default\">Back</li>";
                     insertHtml+="<li data-page=\"1\">1</li>\n\
                                   <li class=\"disabled\">...</li>";

                     for ( var i=0; i<(( totalpages - curentPage) + 3); i++ ) {
                          if ( ((curentPage-2)+i) === curentPage ) {
                              insertHtml+="<li class=\"active\" data-page=\""+curentPage+"\">"+curentPage+"</li>";
                              continue;
                          }
                          //if ((totalpages - curentPage)===2){ console.log("hopaaa"); break;}
                          insertHtml+="<li class=\"default\" data-page=\""+((curentPage-2)+i)+"\">"+((curentPage-2)+i)+"</li>";
                      }

                      if ( curentPage === totalpages  ) { 
                         insertHtml+="<li class=\"disabled\">Next</li><li class=\"disabled\">Last</li>";                                      
                      } else {                
                         insertHtml+="<li data-page=\""+(curentPage+1)+"\">Next</li><li data-page=\""+totalpages+"\">Last</li>";             
                      }


                      //insertHtml+="<li class=\"disabled\">...</li><li class=\"default\" data-page=\"1\" >First</li></ul>";
                      pagElement.html(insertHtml);             
                      insertHtml ="";
                }   
}

function onChangePage(){
    var index = 0;
    $(".pagination li").click( function() { 
        if( isMovie === true){
            searchMovie(parseInt($( this ).data("page")));
        }else if( isActor ===true ) {
            searchPerson(parseInt($( this ).data("page")));
        }        
    });   
}

function searchMovie(newPage){
    clearDetails();
    showBodyLoading(); 
    var mvVal=$("#searchMovie").val().trim();
          
    var results;
    var page=0;
    
    if(typeof newPage==="undefined"){
        page=1;
    }else{
        page=newPage;
    }
   
    if(mvVal !=="") {
         $.ajax({
            url : THE_MOVIE_DB+SEARCH_MOVIE+API_KEY_STRING+"&language=en-US",
            data : "query=" + mvVal + "&page="+page,
            error: function (jqXHR, textStatus, errorThrown) {
                       console.log(jqXHR.statusCode);
            }
            
         }).done(function (data){
             showMovieList(data); 
             hideBodyLoading();
         }).fail(function(){
          alert("Fail loading movies data...!!!");
          //impl error handler
      });
    } else {
          alert("Search movie field is empy");
          $(".container.details span:first-child").html("Total Results: ");
   } 
}

function searchPerson(newPage){
    clearDetails();
    showBodyLoading();
    var mvVal=$("#searchActor").val().trim();
          
    var results;
    var page=0;
    
    if(typeof newPage==="undefined"){
        page=1;
    }else{
        page=newPage;
    }
   
    if(mvVal !=="") {
         $.ajax({
            url : THE_MOVIE_DB+SEARCH_PERSON+API_KEY_STRING+"&language=en-US",
            data : "query=" + mvVal + "&page="+page 
         }).done(function (data){
             showActorList(data);
             hideBodyLoading();
         }).fail(function(){
          alert("Fail loading movies data...!!!");
          //impl error handler
         });
    } else {
          alert("Search movie field is empy");
          $(".container.details span:first-child").html("Total Results: ");
   } 
    
}

function showActorList(data){
    clearDetails();
    var results;   
    var picture="ajax-loader.gif";
    
    if(data['total_results']>0){                
                $(".container.details span:first-child").html("Total Results: " + data['total_results'] + " Total pages: " + data['total_pages']);                
                    $.each(data.results, function(key, val){
                    $("#ulSelect").append("<li class=\"flex\"><span class=\"flex-3\">"+val['id']+"</span>\n\
                                    <span class=\"flex-0\">"+val['name']+"</span></li>");
                    });                                                                
                $("#ulSelect li").click(function(){
                    var id= $(this).children("span:first-child").text();
                    getActorId(id);                  
                });   
    pagination(data);
    onChangePage();    
    }
          
}

function getActorId(actorID) {
    showLoading();
    if( $.isEmptyObject(BaseConfig )){
                getConfig();                
    };   
    
    $.ajax({
          url : THE_MOVIE_DB+ACTOR_ID+actorID+API_KEY_STRING+"&language=en-US"+
                  APPEND_TO_RESPONSE+"movie_credits",
          error: function (jqXHR, textStatus, errorThrown) {
            alert(textStatus);
          }          
      }).fail(function(){
           alert( "Failed loading actor" );       
      }).done(function(data) {         
           showPopupActor(data);           
      });       
}

function showPopupActor(data){
    var poster = BaseConfig.base_url + BaseConfig.poster_size 
                           + data['profile_path'];     
    $("#wrapper").css("display","block");    
    $("#wrapper").click(function(){ 
                    $("#fixed_div img:first").attr("src","ajax-loader.gif");                     
                    $("#fixed_div ul").html("");
                    hideLoading();
                });                
    $("#fixed_div img:first").attr("src",""+poster+""); 
    var html = ""; 
    html+="\n\
         <li class=\"flex\"> <span class=\"popup-span-item\"> Title : </span>  \n\
         <span class=\"popup-span-content-1\">"+data['name']+"</span>\n\
         <span class=\"popup-span-item-1\">***</span> \n\
         <span class=\"popup-span-content\">"+data['popularity']+"</span></li> \n\
    ";
    html+="<li class=\"flex\"><span class=\"popup-span-item\">\n\
            Date of Birth: </span><span class=\"popup-span-content\">"+data['birthday']+"</span></li>";   
      
    html+="<li class=\"flex\"><span class=\"popup-span-item\">\n\
            Movies: </span><div>";
    $.each(data.movie_credits.cast, function(index,val){
        html+="<span class=\"popup-span-content-2\">"+val.title+" </span>";
    });
    html+="</div></li>";
    $("#fixed_div ul").html(html);      
}

function showMovieList(data){
    
    clearDetails();  
    
    var results;   
    var picture="ajax-loader.gif";
    
    if(data['total_results']>0){                
                $(".container.details span:first-child").html("Total Results: " + data['total_results'] + " Total pages: " + data['total_pages']);                
                    $.each(data.results, function(key, val){
                    $("#ulSelect").append("<li class=\"flex\"><span class=\"flex-3\">"+val['id']+"</span>\n\
                                    <span class=\"flex-0\">"+val['title']+"</span>\n\
                                    <span class=\"flex-2\">"+val['release_date']+"</span></li>");
                    });                                                                
                $("#ulSelect li").click(function(){
                    var id= $(this).children("span:first-child").text();
                    getMovieId(id);                  
                });   
    pagination(data);
    onChangePage();    
    }
          
}

function getMovieId(movieID){
    showLoading();
    if( $.isEmptyObject(BaseConfig )){
                getConfig();                
    };   
    
    $.ajax({
          url : THE_MOVIE_DB+MOVIE_ID+movieID+API_KEY_STRING+"&language=en-US"+
                  APPEND_TO_RESPONSE + "credits"
      }).done( function(data){                                      
            showPopupMovie(data); 
      }).fail(function(){
          alert("Fail loading movies data...!!!");
          //impl error handler
      });     
}

function clearDetails(){
    $("#ulSelect").html("");
    $(".pagination").html("");
    $(".container.details span:first-child").html("");    
}

function showPopupMovie(data) {
    
    var poster = BaseConfig.base_url + BaseConfig.poster_size 
                           + data['poster_path'];
    $("#wrapper").css("display","block");
    
    $("#wrapper").click(function(){ 
                    $("#fixed_div img:first").attr("src","ajax-loader.gif");                     
                    $("#fixed_div ul").html("");
                    hideLoading();                   
                });
    var html = "";           
    $("#fixed_div img:first").attr("src",""+poster+"");       
    html+="\n\
         <li class=\"flex\"> <span class=\"popup-span-item\"> Title : </span>  \n\
         <span class=\"popup-span-content-1\">"+data['title']+"</span>\n\
         <span class=\"popup-span-item-1\">***</span> \n\
         <span class=\"popup-span-content\">"+data['vote_average']+"</span></li> \n\
    ";
    
    html+="<li class=\"flex\"><span class=\"popup-span-item\">\n\
            Overview: </span><span class=\"popup-span-content\">"+data['overview']+"</span></li>"; 
    html+="<li class=\"flex\"><span class=\"popup-span-item\">\n\
            Casting: </span><div>";
    $.each(data.credits.cast, function(index,val){
        html+="<span class=\"popup-span-content-2\">"+val.name+" </span>";
    });
    html+="</div></li>";
    $("#fixed_div ul").html(html);      
}

function loadCategories(){
    $.ajax({
        url: THE_MOVIE_DB+MOVIE_LIST+API_KEY_STRING+"&language=en-US",
        dataType: 'json'
    }).done(function( data ) { 
                $.each( data, function( key, val ) {                          
                        if( typeof (val) === 'object') {                        
                            $.each(val, function ( key, value){
                                 $("#movieGenres").append("<option value=\""+value['id']+"\">"+value['name']+"</option>");
                        });                        
                    }                                        
                });                
    }).fail(function(){                  
               $("#selectInsert").hide();
    });  
}

function btnAction(){
            
    $(".btn").click(function () { 
        var pName = $("#searchMovie").val();
        var Actor = $("#searchActor").val();
        var pGenre = $("#movieGenres").val();
        var pYear = $("#searchYear").val();
        var pFilter = $("#sortbyFilter").val();
        var pSelected = toggleRadio(); 
        
        if(isActor===true){
            searchPerson();
        }else if(isMovie===true && pName!==""){            
            searchMovie();
            pName="";
             }else{
                 var metaSearch = new SearchMeta(pGenre,pYear,pFilter,pSelected);
                 discoverMovie(metaSearch);                 
             }       
    });
}

function showLoading(){ 
    $("#wrapper").show();    
}

function showBodyLoading(){ 
    $(".loadingBody").show();     
}

function hideBodyLoading(){
    $(".loadingBody").hide();
}

function hideLoading(){
    $("#wrapper").hide();
}

function activeTab(){
    
    $(".tab-nav li").click(function(event){
        if ((event['target'].className)==="tab-nav-iddle"){
              switch(event['target'].id) {
                  case "actor" : {
                          $(this).removeClass("tab-nav-iddle").addClass("tab-nav-active");
                          $("#movie").removeClass("tab-nav-active").addClass("tab-nav-iddle");
                          $(".srcActor").show();
                          $(".srcMovie").hide();
                          isActor = true;
                          isMovie = false;
                          $("#searchMovie").val("");
                          clearDetails();
                          break;
                  }
                  case  "movie" : {
                          $(this).removeClass("tab-nav-iddle").addClass("tab-nav-active");
                          $("#actor").removeClass("tab-nav-active").addClass("tab-nav-iddle");
                           $(".srcMovie").show();
                          $(".srcActor").hide();
                          isActor = false;
                          isMovie = true;
                          $("#searchActor").val("");
                          clearDetails();
                          break;                      
                  }
            }  
        }
    });
}



$(document).ready(function(){    
    getConfig();
    loadCategories();
    drawSortInputs(); 
    activeTab();
    btnAction();    
});

