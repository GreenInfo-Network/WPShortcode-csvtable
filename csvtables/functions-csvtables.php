<?php
/**
 * CSV-TABLE SHORTCODE
 * [csvtable]
 * shortcode to load a CSV file and generate a table of its contents
 * see also csvtables.js and csvtables.css which provide the frontend code, including the params & options
 *
 * example:
 * [csvtable csvfile="2022_General_Turnout_Rates.csv" columns="STName,Vot_Cnt,VAPcount" labels="State,Votes Counted,Voting Age Population" totals="Vot_Cnt,VAPcount"]
 */

add_shortcode('csvtable', function ($atts) {
    // set defaults, validate, split comma-joined strings into lists
    $atts = shortcode_atts(array(
        'csvfile' => '',  // string
        'columns' => '',  // string, comma-joined list
        'columnlabels' => '',  // string, comma-joined list
        'totals' => '',  // string, comma-joined list
        'tablecssclasses' => 'table table-sm table-hover table-striped mb-0', // string, additional CSS classes for the table element
        'downloadbuttoncssclass' => 'btn btn-sm btn-primary mt-1',  // string or blank
        'caption' => '',  // string
        'width' => '',  // string
    ), $atts);

    $atts['columns'] = explode(',', $atts['columns']);
    $atts['columnlabels'] = $atts['columnlabels'] ? explode(',', $atts['columnlabels']) : null;
    $atts['totals'] = $atts['totals'] ? explode(',', $atts['totals']) : null;

    // enqueue necessary libraries
    wp_enqueue_script('papaparse', get_template_directory_uri() . '/csvtables/papaparse-5.4.1.min.js');

    wp_enqueue_script('datatables', get_template_directory_uri() . '/csvtables/dataTables-1.13.4.min.js');
    wp_enqueue_style('datatables', get_template_directory_uri() . '/csvtables/dataTables-1.13.4.min.css');
    // wp_enqueue_script('datatables-bootstrap5', get_template_directory_uri() . '/csvtables/dataTables.bootstrap5.min.js');
    // wp_enqueue_style('datatables-bootstrap5', get_template_directory_uri() . '/csvtables/dataTables.bootstrap5.min.css');

    wp_enqueue_script('csvtables', get_template_directory_uri() . '/csvtables/functions-csvtables.js');
    wp_enqueue_style('csvtables', get_template_directory_uri() . '/csvtables/functions-csvtables.css');

    // construct and return HTML
    $attrsjson = json_encode($atts);
    $tableid = 'csvtable-' . md5(rand());
    $html = "
        <div class=\"csvtable-wrapper\">
            <table id=\"$tableid\">
                <thead></thead>
                <tbody></tbody>
                <tfoot></tfoot>
            </table>
            <div class=\"csvtable-after\" id=\"$tableid-after\"></div>
            <script>window.addEventListener('DOMContentLoaded', () => { createCsvTable('$tableid', $attrsjson); });</script>
        </div>
    ";
    return $html;
});
