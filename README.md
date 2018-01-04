# erpnextswiss
ERPNext application for Switzerland-specific use cases

ERPNext ([https://www.erpnext.org](https://www.erpnext.org)) is a global, leading, cloud based
open source enterprise resource planning software. ERPNext is a trademark by Frappé Technologies.

The ERPNextSwiss application adds country-specific features to this platform such as 
bank, tax and payment integrations.

## License 
GNU Affero General Public License, refer to LICENSE

## Requirements
Requires an ERPNext server instance (refer to [https://github.com/frappe/erpnext](https://github.com/frappe/erpnext))

## Installation
From the frappe-bench folder, execute

    $ bench get-app https://github.com/libracore/erpnextswiss.git
    $ bench install-app erpnextswiss

## Features 
* Banking
    * Bank import: allows to import bank account statements to update local payment entries (receiving)
    * Payment export: allows to create payment files for banks (pain.001) from payment entries (paying)
* Tax
    * Import monthly average exchange rates
    * VAT declaration