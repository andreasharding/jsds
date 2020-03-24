/*
==========================================================================================
========================   IMPORT LIBRARIES & INIT GLOBALS   =============================
==========================================================================================
*/


const express = require('express');
const promise = require('bluebird');
const cookieParser = require('cookie-parser');//npm install cookie-parser --save
const bodyParser = require("body-parser");
let {PythonShell} = require('python-shell')


// connection credentials to postgres server (should really be imported from secure place!)
cn = {
	host: 'localhost', // 'localhost' is the default;
	port: 5432, // 5432 is the default;
	database: 'andreas',
	user: 'andreas',
	password: ''
};

// some more setup for postgres
const options = {
	promiseLib: promise // overriding the default (ES6 Promise);
};

const pgp = require('pg-promise')(options);
const db = pgp(cn); // this creates a database instance






// this is the actual webserver object
const app = express();
const port = 3000; // the port number to listen on


// some middleware i.e. 'HTTP utilities'

// tell express to use middleware for handling cookies:
app.use(cookieParser());

// This middleware helps unpack POST parameters. Note: it parses JSON for you.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());































/*
==========================================================================================
================================   WEBSOCKET SETUP   =====================================
==========================================================================================
*/



let WebSocketServer = require('ws').Server;
let wss = new WebSocketServer({port: 40510});

wss.on('connection', function (ws, req) {
	console.log('setup connection', req.headers);

	const ip = req.connection.remoteAddress;
	
	ws.on('message', function (message) {
		// console.log('received: %s from %s ', message, ip);
		try {
			console.log('>>: %s from %s', message, ip);
			/*
			console.log(JSON.parse(message));
			console.log(req.headers);
			console.log(req.url);
			console.log(req.method);
			console.log(req.httpVersion);
			*/
			// console.log(req.socket.server._peername);
		}
		catch(e) {
			console.log('error...');
		}
	});
	
	ws.send('snoop');
	
	
	
	ws.on('mouse_loc', function (mxy) {
		console.log('mouse_loc', mxy);
	});
	
	// uncomment this to send something to browser every 10s
	// setInterval(() => ws.send(`${new Date()}`), 10000)
})



function send_ws_msg() {
	ws.send(`${new Date()}`);
}

















/*
==========================================================================================
===============================   HELPER FUNCTIONS   =====================================
==========================================================================================
*/


/**
 * helper function for getting data from postgres
 * 
 * @param {string} sql - the SQL statement for the database to execute
 * @return {string} data - the raw data returned, or empty string if error
 * 
*/

var get_data = function(sql) {
	return db.any(sql)
		.then(data => {
			return data;
		})
	.catch(error => {
		// return error;// this is useful for debugging
		console.log('\u001b[31mERROR (get_data):\u001b[39m', error);
		return '';
	})
    .finally(() => {
		// do any cleanup here
		
	});
}





function log_stuff(req) {
		/*
		console.log(req);
		*/
		console.log('headers', req.headers);
		console.log('httpVersion', req.httpVersion);
		console.log('url', req.url);
		console.log('method', req.method);
		console.log('statusCode', req.statusCode);
		console.log('statusMessage', req.statusMessage);
		console.log('trailers', req.trailers);
		console.log('_eventsCount', req._eventsCount);
		console.log('socket.defaultEncoding', req.socket.defaultEncoding);
}





/**
 *  polyfills for php functions
 */

function isset(item) {
    return (typeof(item) != 'undefined');
}

// only used for arrays here, so this is OK
function count(item) {
    return item.length;
}

// used for joining array elements into string
function implode(sep, elements) {
    return elements.join(sep);
}

// explode — Split a string by a string
function explode(delimiter, str) {
    return str.split(delimiter);
}


function strtoupper(str) {
    return str.toUpperCase();
}



/**
 *  For future development - just passes value straight through for now
 */

function sanitize_input(item) {
    return item;
}


/*
==========================================================================================
================================   SERVER ROUTING   ======================================
==========================================================================================
*/



// ---------------------------------------------------------------------------------------
// This is the most basic route handler for root level URL
// ---------------------------------------------------------------------------------------

app.get('/', (req, res) => {
		// First output details about the HTTP request to the server console
		log_stuff (req);
		
		let html = '<a href="./presentation/">Presentation</a><br /> \
		<a href="./presentation/00.html">Presentation: 0. Servers</a><br /> \
		<a href="./presentation/01.html">Presentation: 1. Getting data</a><br /> \
		<a href="./get_data/query_endpoints.html">Example: 1. Getting data</a><br /> \
		<a href="./basic/form.html">POST</a><br /> \
		<a href="./backchannel/">Messaging backchannel</a><br /> \
		<a href="./cookies/">Cookies</a><br /> \
		<a href="./translate/">Run code in other languages (e.g. Python) - default</a><br /> \
		<a href="./translate?word=hello">Run code in other languages (e.g. Python) - with word appended to GET request</a><br /><hr /> \
		<a href="./globo/"</a>Globe with data<br /> \
		<a href="./iced/">ICED</a><br />';
		
		// Now finish handling the request with a message
		res.send(html);
	}
)






























// ---------------------------------------------------------------------------------------
// This route handler examines and sets a cookie
// ---------------------------------------------------------------------------------------


app.get('/cookies/', (req, res) => {
		// Output details about any cookies set
		console.log('raw cookies', req.headers.cookie);
		console.log('nice cookies', req.cookies);
		log_stuff (req);
		let msg, s, n_cookies = req.cookies.cookies_eaten;
		
		if (n_cookies) {
			n_cookies = +n_cookies;// coerce to number
			s = n_cookies == 1 ? '' : 's';
			msg = `You have eaten ${n_cookies} cookie${s}`;
			n_cookies++;
		} else {
			msg = 'Are you hungry?';
			n_cookies = 1;
		}
		
		// This is all you need to do to set (or update) a cookie
		res.cookie('cookies_eaten', n_cookies, { maxAge: 60000, httpOnly: true });
		res.cookie('random_cookie', Math.random(), { maxAge: 60000, httpOnly: true });
		
		// Now finish handling the request with a message
		res.send(msg);
	}
)






















// ---------------------------------------------------------------------------------------
// The following two handlers both service the same endpoint, 
// but differ in the type of HTTP request
// ---------------------------------------------------------------------------------------



// http://localhost:3000/ajax?q=ncv&city=Wuhan&date=2020-02-02

app.get('/ajax/', (req, res) => {
	console.log(req.query['q']);
	
        let sql, main_output, 
            output = '',
            output_type = 'json',
            http_GET_args = req.query;
        
        // read in parameters from query
        if (isset(req.query['q'])) {
            query_id = req.query['q'];
        } else {
            query_id = "nothing";
        }
        
        
        
        // construct SQL statement
        switch (query_id) {
            case 'ncv':
                // original - only sample_mark concatenated ~1.35 seconds
                sql = "WITH final AS ( \
                        WITH ncv_counts AS ( \
                        SELECT id, cityEnglishName, provinceEnglishName, city_confirmedCount, city_suspectedCount, city_curedCount, city_deadCount, updateTime, lat, lng, \
                        concat(EXTRACT(YEAR FROM updateTime), '-', lpad(EXTRACT(MONTH FROM updateTime)::text, 2, '0'), '-', lpad(EXTRACT(DAY FROM updateTime)::text, 2, '0'), 'T', lpad(EXTRACT(HOUR FROM updateTime)::text, 2, '0')) AS sample_mark \
                        FROM __ncov19 \
                        ORDER BY updateTime \
                        ) \
                        SELECT cityEnglishName, provinceEnglishName, city_confirmedCount, city_suspectedCount, city_curedCount, city_deadCount, sample_mark, lat, lng, \
                        rank() OVER (PARTITION BY sample_mark ORDER BY updateTime) AS pos \
                        FROM ncv_counts \
                        ) \
                        SELECT sample_mark, provinceEnglishName, cityEnglishName, city_confirmedCount, city_suspectedCount, city_curedCount, city_deadCount, lat, lng FROM final \
                        WHERE pos < 2 \
                        ORDER BY sample_mark, provinceEnglishName, cityEnglishName \
                        ; \
                        ";
            break;
            
            
            case 'nothing':
                sql = "SELECT * FROM __iced_bau LIMIT 0;";
            break;
            
            
            default:
                sql = "SELECT * FROM __iced_bau LIMIT 1;";
            break;
        }        



		// This is where the data retrieval happens. It is handled in a promise.
		get_data(sql).then(data => {
			main_output = JSON.stringify(data);
		})
		.catch(error => {
			console.log('\u001b[31mERROR (get_data):\u001b[39m', error);
			main_output = "Something went wrong with querying the database, so there's no data to give you. ";
		})
		.finally(() => {
			res.set('Content-Type', 'application/json')
			res.send(main_output);
		});
	}
)




app.post('/ajax/', (req, res) => {

        let query_params = req.body;
        
        console.log('\u001b[33mPOST (req.headers content-type):\u001b[39m', req.headers['content-type']);
        console.log('\u001b[35mPOST (query_params):\u001b[39m', query_params);
        
        res.set('Content-Type', 'text/html');
        res.send('hello ' + query_params.name);


	}
)













// ---------------------------------------------------------------------------------------


/**
Need this to be able to handle the following queries (note sneaky use of get_data.php):
    http://localhost:3000/get_data.php?q=top_categories
    http://localhost:3000/get_data.php?q=all_variables
    http://localhost:3000/get_data.php?q=key_data&c=56&v=219&y=2000&y2=2050
    http://localhost:3000/get_data.php?q=key_country_data_series&v=219&y=2000&y2=2050
    http://localhost:3000/get_data.php?q=map_data&v=219&y=2000
    http://localhost:3000/get_data.php?q=macc_data&r=EU&s=Agriculture

this looks like this:
    req.query = { q: 'top_categories' }
    req.query = { q: 'all_variables' }
    req.query = { q: 'key_data', c: '56', v: '219', y: '2000', y2: '2050' }
    req.query = { q: 'key_country_data_series', v: '219', y: '2000', y2: '2050' }
    req.query = { q: 'map_data', v: '219', y: '2000' }
    req.query = { q: 'macc_data', r: 'EU', s: 'Agriculture' }

*/


app.get('/get_data.php', (req, res) => {
        console.log('in get_data.php', req.query);//.headers
        
        /*
        Query parameters
        ================
        
        q: query type           top_categories | all_variables | key_data | map_data
        f: output format        json | csv
        y: year (start)         <numeric>
        y2: year (end)          <numeric>
        v: iced_variable        <numeric>
        vv: iced_variable_list  <numeric_list>
        c: country id           <char>
        cc: country_list        <char_list>
        */
        
        let http_GET_args, query_id, output_type, iced_variable, iced_variable_list, country, country_list;
        let dice_year, dice_year_end, region, sector, return_hardcoded_data, output, DEBUG = false;
        let sql = '';
        output = '';
        output_type = 'json';
        http_GET_args = req.query;
        
        // read in parameters from query
        if (isset(http_GET_args['q'])) {
            query_id = http_GET_args['q'];
        } else {
            query_id = "nothing";
        }
        
        if (isset(http_GET_args['f'])) {
            switch (http_GET_args['f']) {
                case 'csv':
                case 'c':
                    output_type = 'csv';
                break;
                
                case 'json':
                case 'j':
                default:
                    output_type = 'json';
                break;
            }
        } else {
            output_type = 'json';
        }
        
        
        if (isset(http_GET_args['v'])) {
            iced_variable = sanitize_input(http_GET_args['v']);
        } else {
            iced_variable = 1;
        }
        
        if (isset(http_GET_args['vv'])) {
            iced_variable_list = explode("_", sanitize_input(http_GET_args['vv']));
        } else {
            iced_variable_list = [];
        }
        
        if (isset(http_GET_args['c'])) {
            country = sanitize_input(http_GET_args['c']);
        } else {
            country = 4;
        }
        
        if (isset(http_GET_args['cc'])) {
            country_list = explode("_", strtoupper(sanitize_input(http_GET_args['cc'])));
        } else {
            country_list = [];
        }
        
        if (isset(http_GET_args['y'])) {
            dice_year = sanitize_input(http_GET_args['y']);
        } else {
            dice_year = 2000;
        }
        
        if (isset(http_GET_args['y2'])) {
            dice_year_end = sanitize_input(http_GET_args['y2']);
        } else {
            dice_year_end = dice_year;
        }

        if (isset(http_GET_args['r'])) {
            region = sanitize_input(http_GET_args['r']);
        } else {
            region = 'EU';
        }

        if (isset(http_GET_args['s'])) {
            sector = sanitize_input(http_GET_args['s']);
        } else {
            sector = 'Agriculture';
        }
        
		
        
        switch (query_id) {
            case 'top_categories':
                return_hardcoded_data = true; // only applies for JSON, so leave sql in place for csv requests
                output = '[{"name":"Agriculture", "value": 1},{"name":"Emissions", "value": 2},{"name":"Fossil Fuels", "value": 3},{"name":"Industry", "value": 4},{"name":"Key Energy Stats", "value": 5},{"name":"Key Indicators", "value": 6},{"name":"Low Carbon Energy", "value": 6},{"name":"Transport", "value": 7}]';
                sql = "SELECT dice_topcategory AS name FROM __iced_bau \
                WHERE dice_topcategory <> '' \
                GROUP BY dice_topcategory ORDER BY dice_topcategory;";
            break;
            
            
            case 'all_variables':
                sql = "SELECT new_dice_id AS name, new_dice_id_var AS value FROM __iced_bau \
                WHERE new_dice_id <> '' \
                GROUP BY new_dice_id, new_dice_id_var ORDER BY new_dice_id_var;";
            break;
            
            
            case 'menu_all_variables':
                return_hardcoded_data = true; // only applies for JSON, so leave sql in place for csv requests
                output = '{"success": true,"results": [{"name": "Filter by tag", "type": "header"},{"name": "Choice 1", "value": "value1", "text": "Choice 1"},{"name": "Choice 2", "value" : "value2","text"  : "Choice 2"},{"name"  : "Choice 3","value" : "value3","text"  : "Choice 3"},{"name"  : "Choice 4","value" : "value4","text"  : "Choice 4"},{"name"  : "Choice 5","value" : "value5","text"  : "Choice 5"}]}';
                sql = "SELECT new_dice_id FROM __iced_bau \
                WHERE new_dice_id <> '' \
                GROUP BY new_dice_id ORDER BY new_dice_id;";
            break;
            
            
            case 'key_data':
                sql = "SELECT id,new_dice_id,dice_year,dice_country_id,dice_country,dice_country_id,dice_country_alpha2,amount,unit FROM __iced_bau";
                sql += " WHERE dice_country_id = " + country + " AND new_dice_id_var = " + iced_variable + " AND dice_year >= " + dice_year + " AND dice_year <= " + dice_year_end + ";";
            break;
            
            
            case 'key_country_data_series':
                sql = "SELECT id,new_dice_id,dice_year,dice_country_id,dice_country,dice_country_id,dice_country_alpha2,amount,unit FROM __iced_bau";
                sql += " WHERE new_dice_id_var = " + iced_variable + " AND dice_year >= " + dice_year + " AND dice_year <= " + dice_year_end;
                if(count(country_list) > 0) {
                    sql += " AND dice_country_alpha2 IN ('" + implode("','", country_list) + "') ";
                } else {
                    sql += " AND dice_country_id IS NOT NULL ";
                }
                sql += " ORDER BY dice_country_id, dice_year;";
            break;
            
            
            case 'map_data':
                sql = "SELECT new_dice_id,dice_year,dice_country,dice_country_id,dice_country_alpha2,amount,unit FROM __iced_bau";
                sql += " WHERE new_dice_id_var = " + iced_variable + " AND dice_year = " + dice_year;
                sql += " AND dice_country IS NOT NULL AND dice_country_id IS NOT NULL AND dice_territory IS NULL";
                sql += " ORDER BY dice_country_alpha2;";
            break;
            
            
            case 'macc_data':
                sql = "SELECT iced_year,region_glocaf,sector_glocaf,emissions_bau,carbon_price,abatement_sector,";
                sql += "emissions_1990,emissions_2000,emissions_2005,emissions_2010 ";
                sql += "FROM __iced_macc ";
                sql += "WHERE Region_GLOCAF ='" + region + "' AND Sector_GLOCAF ='" + sector + "';";
            break;
            
            
            case 'bubble_data':
                sql = "SELECT id,new_dice_id,new_dice_id_var AS vv,dice_year,dice_country_alpha2 AS cc,dice_country,amount FROM __iced_bau ";
                sql += "WHERE dice_year = " + dice_year;
                
                if(count(iced_variable_list) > 0) {
                    sql += " AND new_dice_id_var IN ('" + implode("','", iced_variable_list) + "') ";
                } else {
                    sql += " AND new_dice_id_var IS NOT NULL ";
                }
                
                if(count(country_list) > 0) {
                    sql += " AND dice_country_alpha2 IN ('" + implode("','", country_list) + "') ";
                } else {
                    sql += " AND dice_country_id IS NOT NULL ";
                }
                sql += " ORDER BY dice_country_id, dice_year;";
            break;
            
            
            case 'nothing':
                sql = "SELECT * FROM __iced_bau LIMIT 0;";
            break;
            
            
            default:
                sql = "SELECT * FROM __iced_bau LIMIT 1;";
            break;
        }        
        

		// set these first, override later if necessary
        res.set('charset', 'utf-8');
        res.set('Content-Type', 'application/json');

		if (DEBUG) {
			output = JSON.stringify(sql);
		} else {
		    // if can avoid querying the database, makes things much faster
            if (return_hardcoded_data) {
                res.send(output);
            } else {
                // This is where the data retrieval happens. It is handled in a promise.
                get_data(sql).then(data => {
                    main_output = JSON.stringify(data);
                })
                .catch(error => {
                    console.log('\u001b[31mERROR (get_data):\u001b[39m', error);
                    main_output = "Something went wrong with querying the database, so there's no data to give you. ";
                })
                .finally(() => {
                    switch(output_type) {
                        case 'csv':
                            res.set('Content-Type', 'text/csv');
                        break;

                        case 'json':
                        default:
                    
                        break;
                    }
                    res.send(main_output);
                });		
            }
		}    
	}
)













// ---------------------------------------------------------------------------------------
// calling python script
// ---------------------------------------------------------------------------------------


let story = ['once', 'upon a', 'time', 'there was a dog, cat, and a mouse'];
let python_script = 'py_demo.py';

let cntrl_data = {"cntrl": {},"data": ["src_text"]} ;


// async function returning a promise
async function do_py(py_script, src_text) {
    return new Promise(
    (resolve, reject) => {
    	// if (!pyshell) {
			pyshell = new PythonShell(py_script);
        // }
        let string = '';
        
        pyshell.send(JSON.stringify({"cntrl": {},"data": src_text}));
        
        pyshell.on('message', function (message) {
            string+=message;
        });

        pyshell.end(function (err,code,signal) {
            if (err) {
                reject(err);
            }
            // console.log('The exit code was: ' + code);
            // console.log('The exit signal was: ' + signal);
            resolve(string);
        }); 

    }
)};



async function translate_text(python, source_text, res) {
    console.log('translate_text:', source_text);
    
    let translated_text;
    try {
        translated_text = await do_py(python, source_text);
    }
    catch (error) {
        console.log('\u001b[31mERROR (python):\u001b[39m', error.message);
    }
    
    res.send(translated_text);
}

		



app.get('/translate', function (req, res) {
    
    // read in parameters from query
    if (typeof(req.query['word']) != 'undefined') {
        text_to_translate = [req.query['word']];
    } else {
        text_to_translate = story;
    }

    console.log('\nresponding to translate request...');
    translate_text(python_script, text_to_translate, res);
});










/*
==========================================================================================
===========================   SERVER ANCILLIARY TASKS   ==================================
==========================================================================================
*/


// Tells the server to behave like a traditional (static) webserver for files in the directory called 'static'
app.use(express.static('static'))



// This catches anything that isn't handled by any routing or static server and treats it as a 404 error
app.use(function (req, res, next) {
	log_stuff (req);
	res.status(404).send('<p style="color: red; font-size:400px; text-align: center; font-family: sans-serif;">404</p>')
})






/*
==========================================================================================
================================   SERVER STARTUP   ======================================
==========================================================================================
*/

app.listen(port, () => console.log(`Example app listening on port ${port}!`))






























