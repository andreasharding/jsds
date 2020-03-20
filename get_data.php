<?php
	//declare and initialise variables
	$DEBUG = false;
	$return_hardcoded_data = false; // this allows the return of data without querying db (on a per query basis)
	
	$servername = "localhost";
	$username = "andreasharding";
	$password = "";
	$dbname = "andreasharding";
	
	$sql = '';
	$output = '';
	$output_type = 'json';
	
	
	function sanitize_input($in_var) {
	    // do something here to try to avoid malicious input
	    return $in_var;
	}
	
	try {
		$conn = new PDO("pgsql:host=$servername;dbname=$dbname", $username, $password);
        // set the PDO error mode to exception
		$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);		
        
        
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
        
        // read in parameters from query
        if (isset($_GET['q'])) {
            $query_id = $_GET['q'];
        } else {
            $query_id = "nothing";
        }
        
        if (isset($_GET['f'])) {
            switch ($_GET['f']) {
                case 'csv':
                case 'c':
                    $output_type = 'csv';
                break;
                
                case 'json':
                case 'j':
                default:
                    $output_type = 'json';
                break;
            }
        } else {
            $output_type = 'json';
        }
        
        
        if (isset($_GET['v'])) {
            $iced_variable = sanitize_input($_GET['v']);
        } else {
            $iced_variable = 1;
        }
        
        if (isset($_GET['vv'])) {
            $iced_variable_list = explode("_", sanitize_input($_GET['vv']));
        } else {
            $iced_variable_list = [];
        }
        
        if (isset($_GET['c'])) {
            $country = sanitize_input($_GET['c']);
        } else {
            $country = 4;
        }
        
        if (isset($_GET['cc'])) {
            $country_list = explode("_", strtoupper(sanitize_input($_GET['cc'])));
        } else {
            $country_list = [];
        }
        
        if (isset($_GET['y'])) {
            $dice_year = sanitize_input($_GET['y']);
        } else {
            $dice_year = 2000;
        }
        
        if (isset($_GET['y2'])) {
            $dice_year_end = sanitize_input($_GET['y2']);
        } else {
            $dice_year_end = $dice_year;
        }

        if (isset($_GET['r'])) {
            $region = sanitize_input($_GET['r']);
        } else {
            $region = 'EU';
        }

        if (isset($_GET['s'])) {
            $sector = sanitize_input($_GET['s']);
        } else {
            $sector = 'Agriculture';
        }
        

        
        
        
        switch ($query_id) {
            case 'top_categories':
                $return_hardcoded_data = true; // only applies for JSON, so leave sql in place for csv requests
                $output = '[{"name":"Agriculture", "value": 1},{"name":"Emissions", "value": 2},{"name":"Fossil Fuels", "value": 3},{"name":"Industry", "value": 4},{"name":"Key Energy Stats", "value": 5},{"name":"Key Indicators", "value": 6},{"name":"Low Carbon Energy", "value": 6},{"name":"Transport", "value": 7}]';
                $sql = "SELECT dice_topcategory AS name FROM __iced_bau 
                WHERE dice_topcategory <> ''
                GROUP BY dice_topcategory ORDER BY dice_topcategory;";
            break;
            
            
            case 'all_variables':
                $sql = "SELECT new_dice_id AS name, new_dice_id_var AS value FROM __iced_bau 
                WHERE new_dice_id <> ''
                GROUP BY new_dice_id, new_dice_id_var ORDER BY new_dice_id_var;";
            break;
            
            
            case 'menu_all_variables':
                $return_hardcoded_data = true; // only applies for JSON, so leave sql in place for csv requests
                $output = '{"success": true,"results": [{"name": "Filter by tag", "type": "header"},{"name": "Choice 1", "value": "value1", "text": "Choice 1"},{"name": "Choice 2", "value" : "value2","text"  : "Choice 2"},{"name"  : "Choice 3","value" : "value3","text"  : "Choice 3"},{"name"  : "Choice 4","value" : "value4","text"  : "Choice 4"},{"name"  : "Choice 5","value" : "value5","text"  : "Choice 5"}]}';
                $sql = "SELECT new_dice_id FROM __iced_bau 
                WHERE new_dice_id <> ''
                GROUP BY new_dice_id ORDER BY new_dice_id;";
            break;
            
            
            case 'key_data':
                $sql = "SELECT id,new_dice_id,dice_year,dice_country_id,dice_country,dice_country_id,dice_country_alpha2,amount,unit FROM __iced_bau";
                $sql .= " WHERE dice_country_id = " . $country . " AND new_dice_id_var = " . $iced_variable . " AND dice_year >= " . $dice_year . " AND dice_year <= " . $dice_year_end . ";";
            break;
            
            
            case 'key_country_data_series':
                $sql = "SELECT id,new_dice_id,dice_year,dice_country_id,dice_country,dice_country_id,dice_country_alpha2,amount,unit FROM __iced_bau";
                $sql .= " WHERE new_dice_id_var = " . $iced_variable . " AND dice_year >= " . $dice_year . " AND dice_year <= " . $dice_year_end;
                if(count($country_list) > 0) {
                    $sql .= " AND dice_country_alpha2 IN ('" . implode("','", $country_list) . "') ";
                } else {
                    $sql .= " AND dice_country_id IS NOT NULL ";
                }
                $sql .= " ORDER BY dice_country_id, dice_year;";
                // $DEBUG = true;
            break;
            
            
            case 'map_data':
                $sql = "SELECT new_dice_id,dice_year,dice_country,dice_country_id,dice_country_alpha2,amount,unit FROM __iced_bau";
                $sql .= " WHERE new_dice_id_var = " . $iced_variable . " AND dice_year = " . $dice_year;
                $sql .= " AND dice_country IS NOT NULL AND dice_country_id IS NOT NULL AND dice_territory IS NULL";
                $sql .= " ORDER BY dice_country_alpha2;";
            break;
            
            
            case 'macc_data':
                $sql = "SELECT iced_year,region_glocaf,sector_glocaf,emissions_bau,carbon_price,abatement_sector,";
                $sql .= "emissions_1990,emissions_2000,emissions_2005,emissions_2010 ";
                $sql .= "FROM __iced_macc ";
                $sql .= "WHERE Region_GLOCAF ='" . $region . "' AND Sector_GLOCAF ='" . $sector . "';";
            break;
            
            
            case 'bubble_data':
                $sql = "SELECT id,new_dice_id,new_dice_id_var AS vv,dice_year,dice_country_alpha2 AS cc,dice_country,amount FROM __iced_bau ";
                $sql .= "WHERE dice_year = " . $dice_year;
                
                if(count($iced_variable_list) > 0) {
                    $sql .= " AND new_dice_id_var IN ('" . implode("','", $iced_variable_list) . "') ";
                } else {
                    $sql .= " AND new_dice_id_var IS NOT NULL ";
                }
                
                if(count($country_list) > 0) {
                    $sql .= " AND dice_country_alpha2 IN ('" . implode("','", $country_list) . "') ";
                } else {
                    $sql .= " AND dice_country_id IS NOT NULL ";
                }
                $sql .= " ORDER BY dice_country_id, dice_year;";
            break;
            
            
            case 'nothing':
                $sql = "SELECT * FROM __iced_bau LIMIT 0;";
            break;
            
            
            default:
                $sql = "SELECT * FROM __iced_bau LIMIT 1;";
            break;
        }        
        
		// ...and send it off to the database.
		$stmt = $conn->prepare($sql);
		$stmt->execute();        
        
		// if something fails, set $DEBUG to true at top of script to output the SQL statement
		// rather than attempting to output non-existent response from database
		if ($DEBUG) {
			$output = json_encode($sql);
		} else {
			if ($output_type == 'json') {
			    header('Content-type:application/json;charset=utf-8');
                if (!$return_hardcoded_data) {
                    $result = $stmt->setFetchMode(PDO::FETCH_OBJ);// set the SQL-output array to associative
                    $output = json_encode($stmt->fetchAll()) . "\n";
                }
                
                // if ($query_id == 'bubble_data') {
                //     $output = "{sql: \"" . $sql . "\", data: " . $output . "}";
                // }
                
			} elseif ($output_type == 'csv') {
			    header('Content-type:text/csv;charset=utf-8');
                $result = $stmt->setFetchMode(PDO::FETCH_NUM);// set the SQL-output array to numerically indexed
                // loop through each row of data returned and make into csv by imploding row array
                foreach(new RecursiveArrayIterator($stmt->fetchAll()) as $k=>$v) {
                    $output .= implode ( ',' , $v ) . "\n";
                }
			}
		}    
        
        // sends final output 
        echo $output;
    
    } catch (Exception $e) {
        echo 'Caught exception: ',  $e->getMessage(), "\n", $sql;
    }
	$conn = null; 
?>