//////////////////////////////////////////////////////////////////////////////////////////
// Globals
//////////////////////////////////////////////////////////////////////////////////////////
let data_series_short;
let fopts = {mode: "no-cors"};
let root_url = location.protocol + '//' + location.hostname + (location.port ? ':'+location.port: '') + '/';
let url_sub_path = "";
let v_bau_graph, v_macc_graph, iced_bau_chart;
let current_countries = []; // array of currently selected country codes

let current_variable = null, current_variable_id = 0;
let iced_variables = [null, null, null];
let iced_variable_ids = [0, 0, 0];
let measurement_data = {'ar': 53, 'be': 67, 'de': 88, 'jp': 78, 'ru': 56, 'br': 90}; // for map
let bubble_chart;

let bubble_chart_options = {
    chart: {
        height: 350,
        type: 'bubble',
    },
    dataLabels: {
        enabled: false
    },
    series: [],
    fill: {
        opacity: 0.8
    },
    title: {
        text: 'ICED Bubble Chart'
    },
    xaxis: {
        tickAmount: 12,
        type: 'category',
    },
    yaxis: {
        max: 70
    }
}


// Document Ready: code that is executed after all of page has loaded
$( function() {
    
    //////////////////////////////////////////////////////////////////////////////////////
    // Initialise UI elements 
    // (NB Semantic CSS uses jquery to select UI elements in DOM and configure them)
    //////////////////////////////////////////////////////////////////////////////////////
    
    $('.menu .browse')
      .popup({
        inline     : true,
        hoverable  : true,
        position   : 'bottom left',
        delay: {
          show: 300,
          hide: 800
        }
      })
    ;

    $('.tabular.menu .item').tab();

    $('.ui.range.slider')
      .slider({
        min: 1990,
        max: 2050,
        start: 1990,
        end: 2050,
        step: 5
      })
    ;
    
    


    let update_iced_variables = function(DOM_obj, vars, vars_id, n) {
        if (DOM_obj.innerText != "") {
            vars[n] = DOM_obj.innerText;
            vars_id[n] = +DOM_obj.dataset.value;            
        } else {
            vars[n] = null;
            vars_id[n] = 0;
        }
    }





    $( "#vars_api" ).bind( "click", function(x) {
        update_iced_variables(x.target, iced_variables, iced_variable_ids, 0);
        console.log('variable:', x.target.innerText, x.target.dataset.value);
        if (x.target.innerText != "") {
            current_variable = x.target.innerText;
            current_variable_id = +x.target.dataset.value;            
        } else {
            current_variable = null;
            current_variable_id = 0;
        }
        $( "#tab_intro_p" ).text(current_variable);
        $( "#tab_time_s" ).text(': ' + current_variable);
        $( "#tab_map_s" ).text(': ' + current_variable);

    });
    
    $( "#vars2_api" ).bind( "click", function(x) {
        update_iced_variables(x.target, iced_variables, iced_variable_ids, 1);
        console.log('variable2:', x.target.innerText, x.target.dataset.value);
    });
    
    $( "#vars3_api" ).bind( "click", function(x) {
        update_iced_variables(x.target, iced_variables, iced_variable_ids, 2);
        console.log('variable3:', x.target.innerText, x.target.dataset.value);
    });
    
    
    
        
    $( "#types_api_menu" ).bind( "click", function(x) {
        console.log('types_api_menu:', x.target.innerText, x.target.dataset.value);
    });
    
   
    

    $( "#update_map_btn" ).bind( "click", function() {
        do_update_map('var');
    });

    $( "#random_map_btn" ).bind( "click", function() {
        do_update_map('random');
    });

    $( "#flat_map_btn" ).bind( "click", function() {
        do_update_map('flat');
    });


    
    // Bind actions to UI elements
    $( "#update_bau_chart" ).bind( "click", function() {
        do_update_bau_chart(0);
    });
    
    $( "#update_macc_chart" ).bind( "click", function() {
        console.log('update_macc_chart')
        // do_update_bau_chart(0);
    });
    
    $( "#update_bubble_chart" ).bind( "click", function() {
        console.log('update_bubble_chart')
        do_update_bubble_chart();
    });


    
    
     // This is a quick diagnostic test that echos the HTTP headers used in the AJAX request
    // It is commented out here, as it isn't needed for the operation of this app
    /* 
    fetch('echohead.php')
        .then(echo_head => echo_head.text())
        .then(function(heads) {
            console.log('Headers:', heads);
        });    
    */
    
    
    
    
    
    
    //////////////////////////////////////////////////////////////////////////////////////    
    // Action handlers
    //////////////////////////////////////////////////////////////////////////////////////    
    
    
    function do_update_bau_chart(n) {
        console.log('do_update_bau_chart', current_variable_id, iced_variable_ids[n]);
        let iced_year = 2000, iced_year_end = 2050, cc = "";
        if (current_countries.length > 0) {
            cc = "&cc=" + current_countries.join('_');
        }
        if (iced_variable_ids[n] != 0) {
            let bau_url = root_url + url_sub_path + "get_data.php?q=key_country_data_series&v=" + iced_variable_ids[n] + "&y=" + iced_year + "&y2=" + iced_year_end + cc;

            fetch(bau_url)
                .then(response_t => response_t.json())
                .then(function(country_data) {
                    console.log('BAU: raw data', country_data);
                    if (country_data.length > 0) {
                        let data_obj = clean_multiple_countries(country_data);
                        // this collects data; converts figures-as-strings into numbers and uses good 'ol for-loops
                        for (let i = 0; i < data_obj.data.length; i++) {
                            // categories.push(data_obj.data[i].name); //collect categories, if required
                            for (let j = 0; j < data_obj.data[i].data.length; j++) {
                                data_obj.data[i].data[j] = +data_obj.data[i].data[j]; // coerce to number
                            }
                        }
                        console.log('BAU: processed data', data_obj);
                        
                        
                        // update map data
                        /*
                        let current_year = 0;
                        measurement_data = {};
                        data_obj.data.forEach((c, i) => {measurement_data[c.name.toLowerCase()] = c.data[current_year]});
                        data_obj.data.forEach((c, i) => {console.log(i, c)});
                        console.log('measurement_data', measurement_data)
                        update_map(measurement_data, 'var');
                        */
                        
                        // now take the processed data and update chart with it
                        iced_bau_chart.updateSeries(data_obj.data);
                        let newOptions = {
                            yaxis: {
                                title: {
                                    text: iced_variables[n]
                                }
                            }
                        };
                        iced_bau_chart.updateOptions (newOptions, false, true, true);
                    } else {
                        console.log('No data returned...');
                    }
                });
            } else {
                console.log('No variable selected, so can’t query database...');
            }
        }
   
    
    
    function do_update_bubble_chart() {
        console.log('do_update_bubble_chart', current_variable_id, iced_variable_ids);
        let iced_year = 2000, iced_year_end = 2050, cc = "", vv = "", v_arr = [];
        if (current_countries.length > 0) {
            cc = "&cc=" + current_countries.join('_');
        }
        iced_variable_ids.forEach( (v, i) =>  {if (v > 0) v_arr.push(v);});
        
        //TEMP
        v_arr = [72, 70, 71];
        cc = "&cc=" + ['CH', 'BE', 'BR', 'DE', 'FR', 'GB', 'RU', 'US'].join('_');

        
        if (v_arr.length > 0) {
            vv = "&vv=" + v_arr.join('_');
        }
        
        // AND new_dice_id_var IN (70, 71, 72)
        // AND dice_country_alpha2 IN ('CH', 'BE', 'BR', 'DE', 'FR', 'GB', 'RU', 'US') 
        
//         if (iced_variable_ids[n] != 0) {
            let bubble_url = root_url + url_sub_path + "get_data.php?q=bubble_data" + vv + "&y=" + iced_year + cc;
            console.log('Bubble: get data from ', bubble_url);

            fetch(bubble_url)
                .then(response_t => response_t.json())
                .then(function(bubble_data) {
                    
                    let final_bubble_data = [];
                    let bbbl = _.groupBy(bubble_data, (o) => {return o.cc});
                    
                    Object.keys(bbbl).forEach(function(b){
                        // first get items in same order as submitted for x,y,s
                        let sortbbbl = _.sortBy(bbbl[b], [function(o) { return _.indexOf(v_arr, o.vv); }]);
                        
                        // then collect in correct data structure
                        final_bubble_data.push({'name': b, 'data': [_.flatMap(sortbbbl, function (o) { return [+o.amount]; })]  });
                    });
                    
                    
                    // console.log(JSON.stringify(final_bubble_data));
                    
                    if (final_bubble_data.length > 0) {
//                         bubble_chart.updateSeries(final_bubble_data, true);
                        bubble_chart_options.series = final_bubble_data;
                        bubble_chart = new ApexCharts(
                            document.querySelector("#bubble_chart"),
                            bubble_chart_options
                        );

                        bubble_chart.render();
                        
                        
                        /*
                        let data_obj = clean_multiple_countries(bubble_data);
                        // this collects data; converts figures-as-strings into numbers and uses good 'ol for-loops
                        for (let i = 0; i < data_obj.data.length; i++) {
                            // categories.push(data_obj.data[i].name); //collect categories, if required
                            for (let j = 0; j < data_obj.data[i].data.length; j++) {
                                data_obj.data[i].data[j] = +data_obj.data[i].data[j]; // coerce to number
                            }
                        }
                        console.log('Bubble: processed data', data_obj);
                        */
                                                
                        // now take the processed data and update chart with it
//                         iced_bau_chart.updateSeries(data_obj.data);
//                         let newOptions = {
//                             yaxis: {
//                                 title: {
//                                     text: iced_variables[n]
//                                 }
//                             }
//                         };
//                         iced_bau_chart.updateOptions (newOptions, false, true, true);
                    
                    
                    } else {
                        console.log('No data returned...');
                    }
                });
//             } else {
//                 console.log('No variable selected, so can’t query database...');
//             }
        }
    
    
    
    
    
    //////////////////////////////////////////////////////////////////////////////////////    
    // Data formatting & generation
    //////////////////////////////////////////////////////////////////////////////////////    
    
    
        
    /*
    // this function will generate output in this format
    // data = [
        [timestamp, 23],
        [timestamp, 33],
        [timestamp, 12]
        ...
    ]
    */
    function generate_bubble_data(baseval, count, yrange) {
        var i = 0;
        var series = [];
        while (i < count) {
            var x = Math.floor(Math.random() * (750 - 1 + 1)) + 1;;
            var y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;
            var z = Math.floor(Math.random() * (75 - 15 + 1)) + 15;

            series.push([x, y, z]);
            baseval += 86400000;
            i++;
        }
        return series;
    }
    
    
    
    
    /*
    data format needs to look like this for apexcharts:
    [{
          name: 'Net Profit',
          data: [44, 55, 57, 56, 61, 58, 63, 60, 66]
        }, {
          name: 'Revenue',
          data: [76, 85, 101, 98, 87, 105, 91, 114, 94]
        }, {
          name: 'Free Cash Flow',
          data: [35, 41, 36, 26, 45, 48, 52, 53, 41]
    }]
    and
    xaxis: {categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']}

    
    But it looks like this:
    [
        {
          "id":78,
          "new_dice_id":"Population (Millions)",
          "dice_year":2050,
          "dice_country_id":56,
          "dice_country":"Belgium",
          "amount":12.65760008
        },
        {
          "id":80,
          "new_dice_id":"Population (Millions)",
          "dice_year":2015,
          "dice_country_id":56,
          "dice_country":"Belgium",
          "amount":11.22647681
        }
    ]
    
    So, need to scan through it and group together by new_dice_id -> name, collecting the 
    amount field into an array -> data.
    First, it would be good to make sure the data is sorted correctly. 
    Here, the years look unsorted. Lodash is a utility library that includes a sort function:
    see https://lodash.com/docs/4.17.15#sortBy
    
    Then group by country (so can plot each country's values). However, the thing that is
    collected is the entire object, so you need to flatten this object (actually all objects
    relating to a particular country) into an array consisting only of the amount value.
    This can be done by using _.groupBy followed by _.flatMap on each country.
    
    Then do the same trick on any of the country objects to get the (now sorted) years into
    the x_categories array
    
    
    */
    
    function clean_multiple_countries(key_country_data_series) {
        let data_series = [];
        let series_sort_A = _.sortBy(key_country_data_series, [function(o) { return o.dice_year; }]);
        let series_obj_A = _.groupBy(series_sort_A, function(o) { return o.dice_country_alpha2; });
        Object.keys(series_obj_A).forEach(function(c){
            data_series.push({'name': c, 'data': _.flatMap(series_obj_A[c], function (o) { return [o.amount]; })});
        });
    
        // Now get the categories (in this case, the years). Just choose the first country 
        // listed in the Object.keys - they are all the same as they have been sorted!
        let x_categories = _.flatMap(series_obj_A[Object.keys(series_obj_A)[0]], function (o) { return [o.dice_year]; });
    
        // Also get a label for the axes - this should really come from the dropdown menu that
        // selected the variable, but this doesn't exist yet, so instead dig into the data...
        let y_label = series_obj_A[Object.keys(series_obj_A)[0]][0].new_dice_id;
    
        // What about the units - for the tooltip? That's in the unit field
        let value_unit = series_obj_A[Object.keys(series_obj_A)[0]][0].unit;
    
        // console.log('series_obj_A', series_obj_A);
        // console.log('data_series', data_series);
        // console.log('x_categories', x_categories);
        
        return {data: data_series, categories: x_categories, unit: value_unit, yaxis_label: y_label};
    }
    
    //////////////////////////////////////////////////////////////////////////////////////    
    // setup Vue's HTML templates
    //////////////////////////////////////////////////////////////////////////////////////
    
//     Vue.component('country_list', {
//         props: ['land'],
//         template: '<li><i v-bind:class="land.code + \' flag\'"></i>{{ land.name  }}</li>'
//     })

//     Vue.component('country_menu', {
//         props: ['land'],
//         template: '<div class="item" v-bind:data-value="land.code"><i v-bind:class="land.code + \' flag\'"></i>{{ land.name  }}</div>'
//     })

//     Vue.component('country_list_fm', {
//         props: ['land'],
//         template: '<div class="item"><div class="content"><i v-bind:class="land.code.toLowerCase() + \' flag\'"></i>{{ land.name  }} [{{ land.code.toLowerCase()  }}]</div></div>'
//     })

//     Vue.component('top_categories', {
//         props: ['category'],
//         template: '<a class="item">{{ category.dice_topcategory }}</a>'
//     })

//     Vue.component('all_variables', {
//         props: ['variable'],
//         template: '<a class="item">{{ variable.new_dice_id }}</a>'
//     })
    
    
        
    
    //////////////////////////////////////////////////////////////////////////////////////
    // Now get some data... 
    //////////////////////////////////////////////////////////////////////////////////////
    
    /*
    Asynchronous data acquisition using fetch API rather than some utility library
    like jquery or d3. The fetch api is part of recent JavaScript
    
    data_url = 'http://localhost:8888/beis/DICE_JS/get_data.php';
    data_from_db_jq = ''
    data_from_db_ax = ''
    data_from_db_d3 = ''



    // load data using jQuery (old-style using callback)
    $.get( data_url + '?src=jquery', function( data ) {
      $( ".result" ).html( data );
      console.log( "data in jQuery ajax call:", data );
      data_from_db_jq = data;
    });

    console.log( "data after jQuery ajax call:", data_from_db_jq );



    // Make a request for a user with a given ID
    axios.get(data_url + '?src=axios')
      .then(function (response) {
        // handle success
        console.log(response);
        data_from_db_ax = response.data;
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .finally(function () {
        // always executed
        console.log('axios finally...', data_from_db_ax);
      });

    console.log( "data after axios ajax call:", data_from_db_ax );




    d3.text(data_url + '?src=d3').then(function(data) {
      console.log( "data in d3 ajax call:", data );
      data_from_db_d3 = data;
    });

    console.log( "data after d3 ajax call:", data_from_db_d3 );

    */


    
    /*
    fetch(root_url + url_sub_path + "get_data.php?q=menu_all_variables")
        .then(response_t => response_t.json())
        .then(function(menu_data) {
            console.log('menu_data', menu_data);
        })
        .catch(function(error) {
            // If there is any error you will catch them here
            console.log('Something went wrong', error);
        }); 
     */
    
    
    
    // Two sources for countries data: either from an API
    // let fco_countries_url = "https://country.register.gov.uk/records.json?page-size=5000";
    // or from a file on the same server as this
    let fco_countries_url = "./data/FCO_countries.json";
    
    fetch(fco_countries_url)
        .then(response_t => response_t.json())
        .then(function(country_data) {
        
            // some basic data manipulation required now, as format is unhelpfully convoluted:
            // {
            //    "PT":{
            //       "index-entry-number":"147",
            //       "entry-number":"147",
            //       "entry-timestamp":"2016-04-05T13:23:05Z",
            //       "key":"PT",
            //       "item":[
            //          {
            //             "country":"PT",
            //             "official-name":"The Portuguese Republic",
            //             "name":"Portugal",
            //             "citizen-names":"Portuguese"
            //          }
            //       ]
            //    }
            // }
            
            // the returned data is an object, which makes it (slightly) more awkward to iterate over
            // i.e. need to first get array of the keys of the array, so can then use the forEach array iterator
            let dummy_list = []; // simple array to store cleaned data
            Object.keys(country_data).forEach(function(c, i){
                // console.log(c, i);
                let c_data = country_data[c];
                dummy_list.push( {'id': i, 'name': c_data['item'][0]['name'], 'code': c} );
            });
            
            // console.log(dummy_list);
            // console.log(JSON.parse(JSON.stringify(dummy_list)));

            
            // now in one line using Array.map() - note that you don't need to define an array before and push to it
            // let dummy_list2 = Object.keys(country_data).map( (c, i) =>  {return {'id': i, 'name': country_data[c]['item'][0]['name'], 'code': c}; } );
            // console.log('dummy_list2', dummy_list2);
            
            let country_list = _.sortBy(dummy_list, ['name']);
            let country_menu_items = country_list.map( (c, i) =>  {return {'name': c['name'], 'value': c['code'].toLowerCase(), 'icon': c['code'].toLowerCase()}; } );
            
            // don't want all 199, so get first 10 i.e. elements 0-9, excludes last element mentioned
            // let country_list_10 = country_list.slice(0,10);
            
            // console.log('country_menu_items', country_menu_items);
            

            $('#iced_countries').dropdown({
                className: {
                    label: 'ui image label',
                    icon: 'flag'
                },
                onChange: function(text, value) {
                    // console.log('iced_countries action = ', value);
                    if (value.length == 2) {
                        current_countries.push(value);
                        // console.log('+ current_countries', current_countries);
                    } else {
                        // need to remove the country that was deselcted
                        // 1. identify the country from e.g. "<i class=\"at flag\"></i>Austria"
                        // 2. find the corresponding entry in current_countries and remove it
                        
                        // use regular expression without 'g' flag as this gives you an 
                        // array including the capture group i.e.: ["class=\"at", "at"]
                        // var regex = /class=\"(..)/;
                        let found = value.match(/class=\"(..)/);
                        let removed_country_code = found[1]
                        // console.log('removed_country_code', removed_country_code);
                        
                        // now can find removed_country_code in current_countries and remove it
                        
                        _.pull(current_countries, removed_country_code);
                        // console.log('- current_countries', current_countries);
                    }
                },
                placeholder: 'Select country',
                values: country_menu_items
            });
        
        
        })
        .catch(function(error) {
            // If there is any error you will catch them here
            console.log('Something went wrong', error);
        }); 
 
 
        // Now need to make AJAX requests for info needed to lay out the UI        
        
        /*
        Query parameters
        ================
        
        q: query type       top_categories | all_variables | key_data | map_data
        f: output format    json | csv
        y: year (start)     <numeric>
        y2: year (end)      <numeric>
        v: iced_variable    <numeric>
        c: country id       <numeric>
        
        These are the kind of requests that can be used:
        curl "http://localhost:8888/beis/DICE_JS/get_data.php?q=top_categories"
        curl "http://localhost:8888/beis/DICE_JS/get_data.php?q=top_categories&f=json"
        curl "http://localhost:8888/beis/DICE_JS/get_data.php?q=top_categories&f=csv"
        curl "http://localhost:8888/beis/DICE_JS/get_data.php?q=all_variables"
        curl "http://localhost:8888/beis/DICE_JS/get_data.php?q=default"
        curl "http://localhost:8888/beis/DICE_JS/echohead.php"
        */


        // This is one way of doing multiple AJAX calls in parallel
        
        let iced_variable = 219; //population
        let country = 56; // Belgium (why not?)
        let iced_year = 2000, iced_year_end = 2050;
        let iced_region = 'EU', iced_sector = 'Agriculture';
        
        let data_urls = [   root_url + url_sub_path + "get_data.php?q=top_categories", 
                            root_url + url_sub_path + "get_data.php?q=all_variables",
                            root_url + url_sub_path + "get_data.php?q=key_data&c=" + country + "&v=" + iced_variable + "&y=" + iced_year + "&y2=" + iced_year_end,
                            root_url + url_sub_path + "get_data.php?q=key_country_data_series&v=" + iced_variable + "&y=" + iced_year + "&y2=" + iced_year_end,
                            root_url + url_sub_path + "get_data.php?q=map_data&v=" + iced_variable + "&y=" + iced_year,
                            root_url + url_sub_path + "get_data.php?q=macc_data&r=" + iced_region + "&s=" + iced_sector
                            ];

    // modified from https://www.shawntabrizi.com/code/programmatically-fetch-multiple-apis-parallel-using-async-await-javascript/

    async function getAllUrls(urls) {
        try {
            var data = await Promise.all(
                urls.map(url =>
                        fetch(url).then(
                            (response) => {return response.json();}
                        )));
            return (data);

        } catch (error) {
            console.log(error);
            throw (error);
        }
    };

    // getAllUrls also needs to be wrapped in async/await otherwise it can miss slower fetches
    async function init() {
        var collected_data = await getAllUrls(data_urls);

        console.log('# top_categories', JSON.parse(JSON.stringify(collected_data[0])));
        console.log('# types_api_menu', JSON.parse(JSON.stringify(collected_data[1])));
                
        $('#types_api_menu')
            .dropdown({
                values: collected_data[0]
            });
                
        $('#vars_api')
            .dropdown({
                values: collected_data[1]
            });
        
        $('#vars2_api')
            .dropdown({
                values: collected_data[1]
            });
        
        $('#vars3_api')
            .dropdown({
                values: collected_data[1]
            });

    
        let key_data = collected_data[2];
        let key_country_data_series = collected_data[3];
        let map_data = collected_data[4];
        let macc_data = collected_data[5];
        console.log('macc_data', macc_data);
        
        // the amount has come through as a string from php, so fix that here
        // the trick is to prepend the '+' which forces JS to convert to a number in anticipation
        // of an addition, which never happens. This method uses what's known as a `Unary Operator`.
        // It is faster than other methods, but isn't so obvious if skim-reading.
        // Other ways are to use parseInt(), parseFloat(), Math.floor(), Math.ceil() - the latter two
        // can take strings, but remember they round up or down. Another trick is to multiply
        // a string by 1, so something like key_data[i].amount * 1
        for (var i = 0; i < key_data.length; i++){key_data[i].amount = +key_data[i].amount}
        for (var i = 0; i < key_country_data_series.length; i++){key_country_data_series[i].amount = +key_country_data_series[i].amount}
        for (var i = 0; i < map_data.length; i++){map_data[i].amount = +map_data[i].amount}
    
    
        // now for some charts...
        // see https://en.wikipedia.org/wiki/Comparison_of_JavaScript_charting_libraries
        // apexcharts has support for vue.js, but updating data proved to be difficult, so plain JS is used here
        // https://apexcharts.com/vue-chart-demos/column-charts/basic/
    
        // For key_data = one country
        let series_sort = _.sortBy(key_data, [function(o) { return o.dice_year; }]);
        let series_obj = _.groupBy(series_sort, function(o) { return o.new_dice_id; });
    
        // This is for multiple countries
        let country_data = clean_multiple_countries(key_country_data_series);
        
        
        // {data: data_series, categories: x_categories, unit: value_unit}
        // one more thing - there are too many countries for easy viewing, so maybe shorten array
        data_series_short = country_data.data.slice(0,4);
        console.log('Initial BAU data', JSON.parse(JSON.stringify(data_series_short)));
        
        // set up BAU chart here, as need the data as part of it.
        let iced_bau_options = {
            chart: {
                height: 500,
                type: 'bar',
            },
            plotOptions: {
                bar: {
                horizontal: false,
                columnWidth: '55%',
                endingShape: 'flat'
                },
            },
            dataLabels: {
                enabled: false
            },
            colors: ['#523549','#585C79','#44899D','#38B5A7','#74DD97','#D3FD7C'],
            stroke: {
                show: true,
                width: 2,
                colors: ['transparent']
            },
            title: {
                text: 'BAU data'
            },
            xaxis: {
                categories: country_data.categories,
            },
            yaxis: {
                decimalsInFloat: false,
                title: {
                    text: country_data.yaxis_label
                }
            },
            fill: {
                opacity: 1
            },
            tooltip: {
                    y: {
                        formatter: function (val) {
                        return val.toFixed(1) + " " + country_data.unit;
                    }
                }
            },
            series: data_series_short
        }
        
        // now create chart
        iced_bau_chart = new ApexCharts(
            document.querySelector("#chart"),
            iced_bau_options
        );
        
        // and tell it to draw itself
        iced_bau_chart.render();

    
        
        
        
        
        
        
        
        

        // this is an example from https://apexcharts.com/javascript-chart-demos/bubble-charts/simple/
        let bubble_options = {
            chart: {
                height: 350,
                type: 'bubble',
            },
            dataLabels: {
                enabled: false
            },
            series: [{
                    name: 'Bubble1',
                    data: generate_bubble_data(new Date('11 Feb 2017 GMT').getTime(), 20, {
                        min: 10,
                        max: 60
                    })
                },
                {
                    name: 'Bubble2',
                    data: generate_bubble_data(new Date('11 Feb 2017 GMT').getTime(), 20, {
                        min: 10,
                        max: 60
                    })
                },
                {
                    name: 'Bubble3',
                    data: generate_bubble_data(new Date('11 Feb 2017 GMT').getTime(), 20, {
                        min: 10,
                        max: 60
                    })
                },
                {
                    name: 'Bubble4',
                    data: generate_bubble_data(new Date('11 Feb 2017 GMT').getTime(), 20, {
                        min: 10,
                        max: 60
                    })
                }
            ],
            fill: {
                opacity: 0.8
            },
            title: {
                text: 'Simple Bubble Chart'
            },
            xaxis: {
                tickAmount: 12,
                type: 'category',
            },
            yaxis: {
                max: 70
            }
        }
// console.log(JSON.stringify(bubble_options.series))


bubble_options.series = [
   {
      "name":"Bubble1",
      "data":[[726,39,55]]
   },
   {
      "name":"Bubble2",
      "data":[[199,52,44]]
   },
   {
      "name":"Bubble3",
      "data":[[310,44,58]]
   },
   {
      "name":"Bubble4",
      "data":[[191,26,27]]
   }
];
        let bubble_chart = new ApexCharts(
            document.querySelector("#bubble_chart"),
            bubble_options
        );

        bubble_chart.render();
        
    
}

init();





// Vue.js implementation of Apex chart, from https://github.com/apexcharts/vue-apexcharts
/*
    new Vue({
        el: '#chart2',
        components: {
            apexchart: VueApexCharts,
        },
        data: function() {
          return {
            chartOptions: {
              chart: {
                id: 'vuechart-example',
              },
              xaxis: {
                categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998],
              },
            },
            series: [{
              name: 'series-1',
              data: [30, 40, 45, 50, 49, 60, 70, 81]
            }]
          }
        },
        methods: {
          updateChart() {
            console.log('updateChart');
            const max = 90;
            const min = 20;
            const newData = this.series[0].data.map(() => {
              return Math.floor(Math.random() * (max - min + 1)) + min
            })

            const colors = ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0']

            // Make sure to update the whole options config and not just a single property to allow the Vue watch catch the change.
            this.chartOptions = {
              colors: [colors[Math.floor(Math.random()*colors.length)]]
            };
            // In the same way, update the series option
            this.series = [{
              data: newData
            }]
          }
        }
    })
*/
















//////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////   MAPS   /////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////

















/**/
// Good intro to d3 with emphasis on mapping:
// http://maptimeboston.github.io/d3-maptime/

// data source:
// https://data.worldbank.org/indicator/SP.POP.TOTL


function status(response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response)
  } else {
    return Promise.reject(new Error(response.statusText))
  }
}

function json(response) {
  // Examine/extract the text in the response
  return response.json()
}










let world;

let width = document.getElementById("main_menu").clientWidth;
let height = width / 2;
let eckert_scale = width / 5.3;

const map_prefs = {   'land': {
                        'colour': "#293037"
                    },
                    'petrol_station': {
                        'radius': 1.25
                    }
                };

// some country codes are missing in Natural Earth Data, so fix using this:
let NAME_LONG_LUT = {"Norway":"NO", "France":"FR", "Northern Cyprus":"NC", "Somaliland":"SL"};


/**
scans through map data and fixes broken ISO_A2 code, using call by reference
*/
function fix_ISO_cc(data) {
    let l = data.objects.countries.geometries.length;
    for (let i = 0; i < l; i++) {
        let n = data.objects.countries.geometries[i].properties.NAME_LONG;
        if (typeof(NAME_LONG_LUT[n]) != 'undefined') {
            data.objects.countries.geometries[i].properties.ISO_A2 = NAME_LONG_LUT[n];
        }
    }
}







let world_projection = d3.geoEckert4()
    .center([0, 0])
    .rotate([0, 0])
    .scale(eckert_scale)
    .translate([width / 2, height / 2]);

let uk_projection = d3.geoAlbers()
    .center([0, 55.4])
    .rotate([4.4, 0])
    .parallels([50, 60])
    .scale(6000)
    .translate([width / 2, height / 2]);

let projection = world_projection;



let svg = d3.select('#map')
    .append('svg')
    .attr('width', width)
    .attr('height', height);



let color_scale = d3.scaleSequential(d3.interpolateHsl('black', 'orange'));
/* 
'darkgreen', 'steelblue'
interpolateBlues
interpolateMagma
interpolateWarm
interpolateCool
interpolatePlasma
orange
purple



*/


/**

variable is something to initialise the choropleth with real data already 
contained in the natural earth file, either 'POP_EST' or 'GDP_MD_EST'
or 'flat' or 'random' for sythetic values

*/


function make_unit_scale(map_data, variable, data_range, lin_log='log') {
    let unit_scale;
    if (variable == 'flat' || variable == 'random') {
        unit_scale = d3.scaleLinear()
            .domain(d3.extent(data_range))
            .range([0,1]);
    } else {
        if (map_data != null) {
            data_range = map_data.objects.countries.geometries.map(c => {return c.properties[variable];});
        }
        console.log('data_range', data_range);
        if (lin_log == 'log') {
            unit_scale = d3.scaleLog()
                .domain(d3.extent(data_range))
                .range([0,1]);
        } else {
            unit_scale = d3.scaleLinear()
                .domain(d3.extent(data_range))
                .range([0,1]);
        }
    }
    return unit_scale;
}



function create_map(svg_el, w, h, map_data, map_path, variable) {
    let unit_scale = make_unit_scale(map_data, variable, [0, 100]);
    
    svg_el.append("rect")               // attach a rectangle
        .attr("x", 0)                   // position the left of the rectangle
        .attr("y", 0)                   // position the top of the rectangle
        .attr("height", h)              // set the height
        .attr("width", w)               // set the width
        .attr('fill', '#BFE4FC');       // give it a colour

    // Define the div for the tooltip
    let div = d3.select("body").append("div")	
        .attr("class", "tooltip")				
        .style("opacity", 0);
    
    world = svg_el.append("svg:g").attr("id", "WLD");

    world.selectAll('.country')
        .data(topojson.feature(map_data, map_data.objects.countries).features)
        .enter().append('path')
        .attr('class', function(d) { return 'country ' + d.id; })
        .attr('d', path)
        .attr('current_var_data', function(d){
            // return Math.floor(Math.random() * 100);
            return 0;
        })
        .on("mouseover", function(d) {
            div.transition()		
                .duration(200)		
                .style("opacity", .9);		
            div	.html("<b>" + d.properties.NAME + "</b><br/>GDP (" + d.properties.GDP_YEAR + "): " + d.properties.GDP_MD_EST + "<br/>POP (" + d.properties.POP_YEAR + "): " + d.properties.POP_EST)	
                .style("left", (d3.event.pageX) + "px")		
                .style("top", (d3.event.pageY - 28) + "px");	
            })					
        .on("mouseout", function(d) {		
            div.transition()		
                .duration(500)		
                .style("opacity", 0);	
        })
        .attr('fill', function(d){
            let value, country = d.properties.ISO_A2.toLowerCase();
            // console.log(d.properties[variable]);
            // let value = d3.select(this).attr('current_var_data');
            switch(variable) {
                case 'flat':
                    value = 50;
                break;
                
                case 'random':
                    value = Math.floor(Math.random() * 100);
                break;
                
                default:
                    value = d.properties[variable];
            }
            // console.log(value, unit_scale(value), color_scale(unit_scale(value)));
            return color_scale(unit_scale(value));
        });
  
    
    svg_el.append("path")
        .datum(topojson.mesh(map_data, map_data.objects.countries, (a, b) => {
            // let ap = a.properties, bp = b.properties;
            // console.log(ap.NAME_LONG, ap.ISO_A2, ap.FIPS_10_, ap.POSTAL, ap.WB_A2, bp.NAME, bp.ISO_A2);
            return a !== b;
        }))
        .attr("fill", "none")
        .attr("stroke", "white")
        .attr("stroke-linejoin", "round")
        .attr("d", path);
}



let path = d3.geoPath()
    .projection(projection)
    .pointRadius(function(d) { return map_prefs.petrol_station.radius; });

    
const map_url = './data/simple_world_countries.json';

fetch(map_url)
    .then(status)
    .then(map_data_response => map_data_response.json())
    .then(function(map_src_data) {
        fix_ISO_cc(map_src_data);
        create_map(svg, width, height, map_src_data, path, 'GDP_MD_EST');//POP_EST GDP_MD_EST flat random
    }).catch(function(error) {
        console.log('Request failed', error);
    });


/*
// FOR DELETION?
function xxxxxxupdate_map(measurements) {
    world.selectAll('.country')
        .data(topojson.feature(map_data, map_data.objects.countries).features)
        .enter().append('path')
        .attr('class', function(d) { return 'country ' + d.id; })
        .attr('d', path)
        .attr('current_var_data', function(d){
            // return Math.floor(Math.random() * 100);
            return 0;
        })
        .attr('fill', function(d){
            let country = d.properties.ISO_A2.toLowerCase();
            // console.log(d.properties[variable]);
            // let value = d3.select(this).attr('current_var_data');
            let value = d.properties[variable];
            return color_scale(unit_scale(value));
        });
}
*/

function do_update_map(update_method) {
    let n = 0; // which of the three iced_variable_ids to use - for map, it's always the first
    console.log('do_update_map 1', update_method);
    
    if (update_method != 'var') {
        update_map(measurement_data, update_method);
    } else {
        console.log('do_update_map 2', current_variable_id, iced_variable_ids[n]);
        
        let iced_year = 2000, iced_year_end = 2050, cc = "";
        
        if (current_countries.length > 0) {
            cc = "&cc=" + current_countries.join('_');
        } else {
            cc = "";// explicitly state no countries, as php then checks for this and returns all
        }
        
        if (iced_variable_ids[n] != 0) {
            let bau_url = root_url + url_sub_path + "get_data.php?q=key_country_data_series&v=" + iced_variable_ids[n] + "&y=" + iced_year + "&y2=" + iced_year_end + cc;

            fetch(bau_url)
                .then(response_t => response_t.json())
                .then(function(country_data) {
                    console.log('map: raw data', country_data);
                    if (country_data.length > 0) {
                        let data_obj = clean_multiple_countries(country_data);
                        // this collects data; converts figures-as-strings into numbers and uses good 'ol for-loops
                        for (let i = 0; i < data_obj.data.length; i++) {
                            // categories.push(data_obj.data[i].name); //collect categories, if required
                            for (let j = 0; j < data_obj.data[i].data.length; j++) {
                                data_obj.data[i].data[j] = +data_obj.data[i].data[j]; // coerce to number
                            }
                        }
                        console.log('map: processed data >>>>>>', data_obj);
                    
                    
                        // update map data
                        let current_year = 0;
                        measurement_data = {};
                        data_obj.data.forEach((c, i) => {measurement_data[c.name.toLowerCase()] = c.data[current_year]});
                        // data_obj.data.forEach((c, i) => {console.log(i, c)});
                        console.log('measurement_data', measurement_data)
                        update_map(measurement_data, 'var');

                    } else {
                        console.log('No data returned...');
                    }
                });
            } else {
                console.log('No variable selected, so can’t query database...');
            }
    }
    
}
   
    
    
    
    
    
    
    






function update_map(measurements, variable) {
    let msr_countries = Object.keys(measurements);
//     let measure_arr = msr_countries.map(c => {console.log(c); return measurements[c]})
    let measure_ext = d3.extent( msr_countries.map(c => {return measurements[c]}) );
    let nice_extent = [Math.floor(measure_ext[0]), Math.ceil(measure_ext[1])]
    //[0, 10]
    let unit_scale = make_unit_scale(null, variable, nice_extent, 'linear');

    console.log('measurements', measurements, measure_ext, nice_extent);
    
    world.selectAll('.country')
        .attr('fill', function(d){
            let value, country = d.properties.ISO_A2.toLowerCase();
            // console.log(d.properties[variable]);
            switch(variable) {
                case 'flat':
                    value = 33;
                break;
                
                case 'random':
                    value = Math.floor(Math.random() * 100);
                break;
                
                default:
                    if (msr_countries.includes(country)) {
                        value = measurements[country];
                    } else {
                        value = 0;
                    }
            }
            // console.log(country, value, unit_scale(value), color_scale(unit_scale(value)));
            return color_scale(unit_scale(value));
        });


}










// This is fun stuff for maps - maybe implement if possible


/*
TURF stuff

        // console.log('finished', collected_data[0]);
        let petrol_stations_geo = geo_utilities.make_geojson_from_csv_multi(collected_data[0], feature_set);
        console.log('petrol_stations_geo', petrol_stations_geo);
        
        update_station_data(petrol_stations_geo.features, scale_cluster);// quantize, scale_cluster
        
//         var petrol_breaks = [0, 5000, 10000, 15000, 20000, 25000, 30000];
        var petrol_breaks = [15000, 17500, 20000, 22500, 25000];
        var petrol_iso_bands = turf.isobands(petrol_stations_geo, petrol_breaks, {zProperty: 'stock'});
        console.log("petrol_iso_bands", petrol_iso_bands);

        var petrol_line_grid = svg.selectAll("#petrol_station_isolines").selectAll("path").data(petrol_iso_bands.features);

        var petrol_isolines = petrol_line_grid
            .enter().append("svg:path")
                .attr("class", function(d, i) {return "iso_line";})
                .attr("d", path)
                .attr("fill", function(d, i) {return "none";})
                .attr("stroke", function(d, i) {return "#00f";})
                .on("click", function(d, i) {
                    console.log("isoline", i, d);
                });
        
    

*/





//////////////////////////////////////////////////////////////////////////////////////////
/*

//id,sitename,postcode,lat,lon,capacity,stock
var feature_set = [	{name: "sitename", pos: 1, section: "properties", type: "text", js: 'object'},
                {name: "postcode", pos: 2, section: "properties", type: "text", js: 'object'},
                {name: "lat", pos: 3, section: "geometry", type: "float", js: 'object'},
                {name: "lon", pos: 4, section: "geometry", type: "float", js: 'object'},
                {name: "capacity", pos: 5, section: "properties", type: "float", js: 'object'},
                {name: "stock", pos: 6, section: "properties", type: "float", js: 'object'}
];
var colour_range_1A = ['#444', '#12757E', '#1D8D74', '#5AA25E', '#9DAF47', '#E7B447'];//greeny-blue -> orangey-yellow
var grey_range_1 = ['#4F4036', '#43372E', '#362D26', '#2B241E', '#201B16'];//redish greys

// 				petrol_stations.forEach(function (e, i) {
// 					petrol_values.push(e.stock);
// 				});

var petrol_values = [0, 100];

var petrol_values_extent = d3.extent(petrol_values);
console.log('petrol_values_extent', petrol_values_extent);
console.log('grey_range_1', grey_range_1);


var scale_cluster = d3.scaleCluster()
    .domain(petrol_values)
    .range(colour_range_1A);


var quantile = d3.scaleQuantile()
    .domain(petrol_values_extent)
    .range(colour_range_1A);

var quantize = d3.scaleQuantize()
    .domain(petrol_values_extent)
    .range(grey_range_1);


// console.log('quantize', quantize);


// console.log(d.properties.stock, colour_scaler(d.properties.stock));


var update_station_data = function (petrol_data, colour_scaler){
	console.log('update_station_data', petrol_data);
	var all_petrol_stations = svg.selectAll("#petrol_stations").selectAll("path").data(petrol_data);
    // console.log('all_petrol_stations', all_petrol_stations);
    
	var new_petrol_stations = all_petrol_stations
		.enter().append("svg:path")
			.attr("class", "petrol_station")
			.attr("d", path)
//             .attr("r", function (d) { return 1; })
			.attr("fill", function(d, i) {return colour_scaler(d.properties.stock);})
			.on("click", function(d, i) {
				console.log("petrol station", i, d);
			});

	all_petrol_stations.transition().duration(400)
		.attr("fill", function(d, i) {return colour_scaler(100 * d.properties.stock/d.properties.capacity);});

	all_petrol_stations.exit().transition().duration(400)
		.attr("opacity", 0)
		.remove();
}






// create a grid of points with random z-values in their properties
var extent = [-4, 48, 1, 60];//extent in minX, minY, maxX, maxY order
var cellWidth = 1;
var pointGrid = turf.pointGrid(extent, cellWidth, {units: 'degrees'});

for (var i = 0; i < pointGrid.features.length; i++) {
    pointGrid.features[i].properties.stock = Math.random() * 10;
}
var breaks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

var iso_lines = turf.isolines(pointGrid, breaks, {zProperty: 'stock'});
var iso_bands = turf.isobands(pointGrid, breaks, {zProperty: 'stock'});


var point_grid = svg.selectAll("#point_grid").selectAll("path").data(pointGrid.features);
console.log('point_grid', point_grid);


var new_petrol_station_pointgrid = point_grid
    .enter().append("svg:path")
        .attr("class", function(d, i) {return "iso_point";})
        .attr("d", path)
        .attr("fill", function(d, i) {return "#f00";})
        .on("click", function(d, i) {
            console.log("isoline", i, d);
        });


var line_grid = svg.selectAll("#petrol_station_isolines").selectAll("path").data(iso_bands.features);

var new_petrol_station_isolines = line_grid
    .enter().append("svg:path")
        .attr("class", function(d, i) {return "iso_line";})
        .attr("d", path)
        .attr("fill", function(d, i) {return "none";})
        .attr("stroke", function(d, i) {return "#0f0";})
        .on("click", function(d, i) {
            console.log("isoline", i, d);
        });


*/











});








