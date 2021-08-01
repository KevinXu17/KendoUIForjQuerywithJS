import "../shared/style-imports";

import './active-issues.css';

import $ from "jquery";
import "bootstrap/dist/js/bootstrap";
import '@progress/kendo-ui/js/kendo.all';

import { DashboardPageModel } from './dashboard-page-model';

const dashboardPageModel = new DashboardPageModel();
let usersComboBox = null;

dashboardPageModel.filter$.subscribe(filter => {
    if (filter && filter.dateStart && filter.dateEnd) {
        const range = `${filter.dateStart.toDateString()} - ${filter.dateEnd.toDateString()}`;
        $('#spanFilteredDateRange').html(range);
    }
});

dashboardPageModel.statusCounts$.subscribe(results => {
    if (results) {
        $('#statusCountsActiveItemsCount').text(results.activeItemsCount);
        $('#statusCountsClosedItemsCount').text(results.closedItemsCount);
        $('#statusCountsOpenItemsCount').text(results.openItemsCount);
        $('#statusCountsCloseRate').text(`${Math.floor(results.closeRate * 100) / 100}%`);
    }
});

dashboardPageModel.users$.subscribe(users => {
    if (users && usersComboBox) {
        usersComboBox.dataSource.data(users);
    }
})

$(() => {

    usersComboBox = $('#inputAssignee').kendoComboBox({
        dataTextField: "fullName",
        dataValueField: "id",
        template: `
        <div class="row" style="margin-left: 5px;">
        <img src=#=avatar#
        class="li-avatar rounded mx-auto d-block" /><span style="margin-left: 5px;">#=fullName#</span>
        </div>
        `,
        dataSource: [],
        open: () => dashboardPageModel.usersRequested(),
        change: (e) => {
            dashboardPageModel.selectedUserIdStr = e.sender.value();
            dashboardPageModel.userFilterValueChange();
        }
    }).data("kendoComboBox");

    $('.pt-class-range-group').kendoButtonGroup();

    $('.pt-class-range-filter')
    .click((e) => {
        const range = Number($(e.currentTarget).attr('data-range'));
        dashboardPageModel.onMonthRangeSelected(range);
    });
});


dashboardPageModel.refresh();

