/**
 * createCsvTable(tableid, options)
 * create a CSV-driven DataTables table with the [csvtable] shortcode
 */

function createCsvTable(tableid, options) {
    // default options and options validation
    options = Object.assign({
        // csvfile = URL string, the URL the CSV file
        'csvfile': undefined,
        // columns = array, column names in the CSV to be displayed
        'columns': [],
        // columnlabels = array, labels for those columns; if omitted, will use column names as-given
        'columnlabels': [],
        // totals = array, column names from the "columns" setting, where a Total should be added to the bottom of the table
        'totals': [],
        // tablecssclasses = CSS classes to add to the table element
        'tablecssclasses': 'table table-sm table-hover table-striped table-bordered',
        // downloadbuttoncssclass = CSS classes to apply to the Download CSV button; pass blank to not add the button
        'downloadbuttoncssclass': 'btn btn-sm btn-primary mt-1 float-end',
        // caption = string, a caption for the table which will be displayed at the bottom
        'caption': '',
        // width = a CSS string for the width of the wrapper/container e.g. "500px" or "100%" or "calc(100% - 50px)"
        'width': undefined,
    }, options);

    if (! options.csvfile) throw new Error('createCsvTable() missing required option: csvfile');
    if (! options.columns) throw new Error('createCsvTable() missing required option: columns');
    if (! options.columnlabels || ! options.columnlabels.length) options.columnlabels = options.columns;

    // make sure the table exists and is well structured
    // set the wrapper's width, if given, and check that the target element exists
    const table = document.getElementById(tableid);
    const tbody = table.querySelector('tbody');
    const thead = table.querySelector('thead');
    const tfoot = table.querySelector('tfoot');
    const bottomarea = document.getElementById(`${tableid}-after`);
    if (! table || table.tagName != 'TABLE') throw new Error(`createCsvTable() no such TABLE ${tableid}`);

    if (options.width) {
        table.parentElement.style.width = options.width;
    }

    // set the table's CSS classes
    table.className = options.tablecssclasses;
    table.classList.add('csvtable');

    // lay out the table header TR and THs
    const header = document.createElement('TR');
    options.columnlabels.forEach((name, i) => {
        const th = document.createElement('TH');
        th.innerText = name;

        // all columns other than 1st, right-align
        if (i != 0) th.style.textAlign = 'right';

        header.appendChild(th);
    });
    thead.appendChild(header);

    const csvurl = options.csvfile;

    // fetch the CSV file, then initialize a DataTables from the CSV rows
    Papa.parse(csvurl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: function (results) {
            // column definitions based on options.columns et al
            // this is what maps each column's value onto a CSV field,
            // and provides other column-specific tweaks such as text-alignment
            const dtcolumns = options.columns.map((fieldname, i) => {
                const col = { data: fieldname };

                // render method for this column (all columns) = toLocaleString()
                // which is harmless on strings and nice on integers
                // may need to revisit based on future CSVs and needs
                col.render = function (data, type, row) {
                    return data.toLocaleString();
                };

                return col;
            });

            // construct the DataTable, and pass the CSV rows as-given
            // the mapping of fields to columns is dtcolumns defined above
            const datatable = jQuery(table).DataTable({
                // column settings: field name, alignment, ...
                columns: dtcolumns,
                // default sorting = none, use the sequence in CSV
                order: [],
                // extraneous UI
                paging: false,
                searching: false,
                info: false,
                columns: dtcolumns,
                orderMulti: false,
            });
            datatable.rows.add(results.data).draw();

            // add a Total row
            if (options.totals && options.totals.length) {
                const footer = document.createElement('TR');

                options.columns.forEach((fieldname, i) => {
                    const th = document.createElement('TH');
                    footer.appendChild(th);

                    if (i == 0) return th.innerText = 'TOTAL';  // 1st column, wouldn't make sense to do sums here anyway
                    else if (options.totals.indexOf(fieldname) == -1) return;  // this column not in options.totals, skip

                    const grandtotal = results.data.reduce((sum, thisone) => sum + thisone[fieldname], 0);
                    th.innerText = grandtotal.toLocaleString();
                    th.style.textAlign = 'right';
                });

                tfoot.appendChild(footer);
            }

            // add a Download CSV button
            if (options.downloadbuttoncssclass) {
                const button = document.createElement('a');
                button.innerText = 'Download CSV';
                button.className = options.downloadbuttoncssclass;
                button.download = '';
                button.href = csvurl;
                bottomarea.appendChild(button);
            }

            // add the caption
            if (options.caption) {
                const caption = document.createElement('DIV');
                caption.id = `${tableid}-caption`;
                caption.textContent = options.caption;
                bottomarea.appendChild(caption);
                table.setAttribute('aria-described-by', caption.id);
            }
        },
        error: function() {
            console.error(`createCsvTable() Could not load CSV file ${csvurl}`);
        },
    });
}
