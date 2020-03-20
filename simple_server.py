from flask import Flask, url_for
from flask import request
import subprocess
import pandas as pd



app = Flask(__name__)






def handle_ajax_get():
    """
    use this to do something useful.
    As an example, this further calls an R script to do something else...
    """
    print('handle_ajax_get')
    # return '{"data": {"records": []}, "type": "GET response"}'
    # Define command and arguments
    command = 'Rscript'
    path2script = '/Users/andreas/Documents/http/do_something_useful.r'
    
    # args to pass to search collector: it's a list so can have multiple items, though could also be just the one...
    args = ["coronavirus OR COVID-19",
            "other search terms as required..."
            ]

    
    # Build subprocess command
    cmd = [command, path2script] + args
    
    # check_output will run the command and store to result
    query_results = subprocess.check_output(cmd, universal_newlines=True)
    
    # for further processing in Python, maybe turn this into a dataframe here
    query_results_df = pd.read_json(query_results)

    # but this may not even be necessary if just want to pass json straight to browser
    return query_results







def handle_ajax_post():
    print('handle_ajax_post')
    return {
        "data": {"records": []},
        "type": "POST response"
        }








index_page = '<a href="./ajax/">get query from R</a><br /> \
		<a href="./static/important_stuff/index.html">get static page</a><br />'



@app.route("/")
def hello():
    return index_page




@app.route('/ajax/', methods=['GET', 'POST'])
def handle_ajax():
    print('handle_ajax', request.method)
    if request.method == 'POST':
        print('POST handle_ajax')
        return handle_ajax_post()
    else:
        print('GET handle_ajax')
        return handle_ajax_get()

