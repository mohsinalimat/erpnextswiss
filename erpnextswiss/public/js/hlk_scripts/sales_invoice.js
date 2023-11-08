frappe.ui.form.on('Sales Invoice', {
    validate(frm) {
        validate_hlk_element_allocation(frm);
    },
    refresh(frm) {
        frappe.call({
            "method": "erpnextswiss.erpnextswiss.page.bkp_importer.utils.get_item_group_for_structur_element_filter",
            "async": false,
            "callback": function(response) {
                var item_group_for_structur_element_filter = response.message;
                frm.fields_dict['hlk_structur_organisation'].grid.get_field('main_element').get_query = function(doc, cdt, cdn) {
                    return {
                        filters:[
                            ['item_group', '=', item_group_for_structur_element_filter]
                        ]
                    }
                };

                frm.fields_dict['hlk_structur_organisation'].grid.get_field('parent_element').get_query = function(doc, cdt, cdn) {
                    return {
                        filters:[
                            ['item_group', '=', item_group_for_structur_element_filter]
                        ]
                    }
                };

                frm.fields_dict['items'].grid.get_field('hlk_element').get_query = function(doc, cdt, cdn) {
                    return {
                        filters:[
                            ['item_group', '=', item_group_for_structur_element_filter]
                        ]
                    }
                };
            }
        });

        cur_frm.fields_dict['introduction_template'].get_query = function(doc) {
             return {
                 filters: {
                     "sales_invoice": 1,
                     "introduction": 1
                 }
             }
        };

        cur_frm.fields_dict['closing_text_template'].get_query = function(doc) {
             return {
                 filters: {
                     "sales_invoice": 1,
                     "closing_text": 1
                 }
             }
        };

        if (!frm.doc.__islocal && cur_frm.doc.docstatus != '1') {
            if (!cur_frm.custom_buttons[__("Transfer HLK Discounts")]) {
                frm.add_custom_button(__("Transfer HLK Discounts"), function() {
                    if (cur_frm.is_dirty()) {
                        frappe.msgprint(__("Please save Document first"));
                    } else {
                        transfer_structur_organisation_discounts(frm);
                    }
                }, __("HLK Tools"));
            }
            if (!cur_frm.custom_buttons[__("Calc HLK Totals")]) {
                frm.add_custom_button(__("Calc HLK Totals"), function() {
                    if (cur_frm.is_dirty()) {
                        frappe.msgprint(__("Please save Document first"));
                    } else {
                        calc_structur_organisation_totals(frm);
                    }
                }, __("HLK Tools"));
            }
            if (!cur_frm.custom_buttons[__("Recalc Special Discounts")]) {
                frm.add_custom_button(__("Recalc Special Discounts"), function() {
                    if (cur_frm.is_dirty()) {
                        frappe.msgprint(__("Please save Document first"));
                    } else {
                        recalc_special_discounts(frm);
                    }
                }, __("HLK Tools"));
            }
        }

        if (frm.doc.__islocal) {
            frm.add_custom_button(__("Remove Zero Positions"), function() {
                remove_zero_positions(frm);
            }, __("HLK Tools"));
        }
    },
    onload(frm) {
        if (frm.doc.__islocal) {
            frm.add_custom_button(__("Remove Zero Positions"), function() {
                remove_zero_positions(frm);
            }, __("HLK Tools"));
        },

        //Generate Number RF
        'use strict';
    		const CHARCODE_A = 'A'.charCodeAt(0);
    		const CHARCODE_0 = '0'.charCodeAt(0);
    		const FORMAT = /^[0-9A-Z]{1,}$/;
    		const FORMAT_RF = /^RF[0-9]{2}[A-Z0-9]{1,21}$/;
    		const FORMAT_RF_BODY = /^[A-Z0-9]{1,21}$/;
    		const FORMAT_RF_HEAD = 'RF';

    		var iso7064 = {
    			compute: function(rawValue) {
    				const value = stringifyInput1(rawValue);
    				if (!value.match(FORMAT)) {
    					throw new Error('Invalid data format; expecting: \'' + FORMAT + '\', found: \'' + value + '\'');
    				}
    				return mod97(value);
    			},
    			computeWithoutCheck: function(rawValue) {
    				return mod97(rawValue);
    			}
    		};

    		function stringifyInput1(rawValue) {
    			if (rawValue === null || rawValue === undefined) {
    				throw new Error('Expecting \'rawValue\' of type \'string\', found: \'' + rawValue + '\'');
    			}
    			if (typeof rawValue !== 'string') {
    				throw new Error('Expecting \'rawValue\' of type \'string\', found: \'' + (typeof rawValue) + '\'');
    			}
    			return rawValue;
    		}

    		function mod97(value) {
    			var buffer = 0;
    			var charCode;
    			for (var i = 0; i < value.length; i += 1) {
    				charCode = value.charCodeAt(i);
    				buffer = charCode + (charCode >= CHARCODE_A ? buffer * 100 - CHARCODE_A + 10 : buffer * 10 - CHARCODE_0);
    				if (buffer > 1000000) {
    					buffer %= 97;
    				}
    			}
    			return buffer % 97;
    		}

    		var iso11649 = {
    			generate: function(rawValue) {
    				const value = stringifyInput2(rawValue);
    				if (!value.match(FORMAT_RF_BODY)) {
    					throw new Error('Invalid Creditor Reference format; expecting: \'' + FORMAT_RF_BODY + '\', found: \'' + value + '\'');
    				}
    				return FORMAT_RF_HEAD + ('0' + (98 - iso7064.computeWithoutCheck(value + FORMAT_RF_HEAD + '00'))).slice(-2) + value;
    			},
    			validate: function(rawValue) {
    				const value = stringifyInput2(rawValue);
    				if (!value.match(FORMAT_RF)) {
    					throw new Error('Invalid Creditor Reference format; expecting: \'' + FORMAT_RF + '\', found: \'' + value + '\'');
    				}
    				return iso7064.computeWithoutCheck(value.substring(4, value.length) + value.substring(0, 4)) === 1;
    			}
    		};

    		function stringifyInput2(rawValue, valueName = 'rawValue') {
    			if (rawValue !== null && rawValue !== undefined) {
    				switch (typeof rawValue) {
    					case 'string':
    						return rawValue.toUpperCase().replace(/[^0-9A-Z]/g, '');
    					default:
    						throw new Error('Expecting ' + valueName + ' of type \'string\', found: \'' + (typeof rawValue) + '\'');
    				}
    			}
    			throw new Error('Expecting ' + valueName + ' of type \'string\', found: \'' + rawValue + '\'');
    		}
    		var random = Math.floor(Math.random() * 999999999999);
    		var generatorRF = iso11649.generate(`'${ random }'`);
    		var generatorRFStr = generatorRF.replace(/(.{4})(?=.)/g, '$1 ');
    		if (frm.is_new()) {
    			frm.set_value('reference_number', generatorRFStr);
    			frm.set_value('reference_number_full', generatorRF);
    		}
    }
})

function recalc_special_discounts(frm) {
    if (cur_frm.doc.special_discounts) {
        var discounts = cur_frm.doc.special_discounts;
        var total_discounts = 0;
        discounts.forEach(function(entry) {
            if (entry.discount_type == 'Percentage') {
                var percentage_amount = 0;
                if (entry.is_cumulative) {
                    percentage_amount = (((cur_frm.doc.total - total_discounts) / 100) * entry.percentage);
                } else {
                    percentage_amount = ((cur_frm.doc.total / 100) * entry.percentage);
                }
                total_discounts += percentage_amount;
                entry.discount = percentage_amount;
            } else {
                var main_structur_elements = cur_frm.doc.hlk_structur_organisation;
                main_structur_elements.forEach(function(hlk_entry) {
                    if (!hlk_entry.parent_element) {
                        var percentage = ((100 / hlk_entry.net_total) * hlk_entry.total);
                        var percentage_amount = 0;
                        percentage_amount = ((entry.discount / 100) * percentage);
                        total_discounts += percentage_amount;
                        entry.discount = percentage_amount;
                    }
                });
            }
        });
        cur_frm.set_value('apply_discount_on', 'Net Total');
        cur_frm.set_value('discount_amount', total_discounts);
    }
}

function remove_zero_positions(frm) {
    // remove all zero qty rows
    var tbl = cur_frm.doc.items || [];
    var i = tbl.length;
    while (i--)
    {
        if (cur_frm.get_field("items").grid.grid_rows[i].doc.qty <= 0) {
            cur_frm.get_field("items").grid.grid_rows[i].remove();
        }
    }
}


function validate_hlk_element_allocation(frm) {
    frappe.call({
        "method": "erpnextswiss.erpnextswiss.page.bkp_importer.utils.validate_hlk_element_allocation",
        "async": false,
        "callback": function(response) {
            if (response.message == 'validate') {
                var hlk_element_allocation = check_hlk_element_allocation(frm);
                if (hlk_element_allocation != '') {
                    frappe.msgprint( __("Zuweisungen Strukturelemente unvollständig, prüfen Sie folgende Artikelpositionen:") + hlk_element_allocation, __("Validation") );
                    frappe.validated=false;
                }
            }
        }
    });
}

function calc_structur_organisation_totals(frm) {
    if (!frm.doc.__islocal) {
        frappe.dom.freeze(__("Calc HLK Totals..."));
        frappe.call({
            "method": "erpnextswiss.erpnextswiss.page.bkp_importer.utils.calc_structur_organisation_totals",
            "args": {
                "dt": "Sales Invoice",
                "dn": frm.doc.name
            },
            "async": false,
            "callback": function(response) {
                var jobname = response.message;
                if (jobname) {
                    let calc_refresher = setInterval(calc_refresher_handler, 3000, jobname);
                    function calc_refresher_handler(jobname) {
                        frappe.call({
                        'method': "erpnextswiss.erpnextswiss.page.bkp_importer.utils.is_calc_job_running",
                            'args': {
                                'jobname': jobname
                            },
                            'callback': function(res) {
                                if (res.message == 'refresh') {
                                    clearInterval(calc_refresher);
                                    frappe.dom.unfreeze();
                                    cur_frm.reload_doc();
                                }
                            }
                        });
                    }
                } else {
                    frappe.dom.unfreeze();
                }
            }
        });
    }
}

function transfer_structur_organisation_discounts(frm) {
    if (!frm.doc.__islocal) {
        frappe.call({
            "method": "erpnextswiss.erpnextswiss.page.bkp_importer.utils.transfer_structur_organisation_discounts",
            "args": {
                "dt": "Sales Invoice",
                "dn": frm.doc.name
            },
            "freeze": true,
            "freeze_message": __("Transfer HLK Discounts..."),
            "callback": function(response) {
                calc_structur_organisation_totals(frm);
            }
        });
    }
}

function check_hlk_element_allocation(frm) {
    var feedback = '';
    var items = cur_frm.doc.items;
    items.forEach(function(item_entry) {
        if (item_entry.hlk_element == null) {
            feedback = feedback + '<br>#' + String(item_entry.idx);
        }
    });
    return feedback
}
