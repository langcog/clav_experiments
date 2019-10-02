<?php
	$experiment_result = $_POST['postresult_array']; //gets the post data from javascript, namely the experiment results
	$new_line = "\n";
	$out_file_name = $_POST['result_file_path'];
	foreach ($experiment_result as $trial) { //iterates through each array of multidimensional array
		foreach ($trial as $item) { //iterates through each item in each array
			$item = chop($item); //cuts off newlines or other whitespace
			$item = $item . ","; //concatenates a comma to be parsed correctly by .csv
			file_put_contents($out_file_name, $item, FILE_APPEND);
		}
		file_put_contents($out_file_name, $new_line, FILE_APPEND);
	}
?>