import "../../shared/style-imports";
import "./details-screen.css";

import $ from "jquery";
import  {getIndicatorClass} from '../../shared/helpers/priority-styling';
import { ItemType } from "../../core/constants";

let detailsScreenModel = undefined;

$(document).on("keyup", ".pt-text-field", (e) => {
  //update form model/
  const fieldObj = $(e.currentTarget);
  const formFieldName = fieldObj.attr("name");
  detailsScreenModel.itemForm[formFieldName] = fieldObj.val();
});

$(document).on("blur", ".pt-text-field", (e) => {
  //save changes
  detailsScreenModel.notifyUpdateItem();
});

$(document).on("click", "#btnAssigneeModal", () => {
  detailsScreenModel.onUsersRequested();
});

$(document).on("click", ".pt-assignee-item", (e) => {
  const selUserId = Number($(e.currentTarget).attr("data-user-id"));
  detailsScreenModel.selectUserById(selUserId);
});

function onFieldChange(e) {
  const fieldObj = $(e.currentTarget);
  const fieldName = fieldObj.attr("name");
  detailsScreenModel.itemForm[fieldName] = fieldObj.val();
  detailsScreenModel.notifyUpdateItem();
}

function onNonTextFieldChange(e) {
  onFieldChange(e);
  detailsScreenModel.notifyUpdateItem();
}

function getIndicatorImage(item) {
  return ItemType.imageResFromType(item);
}

function itemTypeTemplate(it) {
  return `
  <img src="${getIndicatorImage(it)}" class="backlog-icon">
  <span>${it}</span>
  `;
}

function priorityTemplate(p) {
  return `<span class="badge ${getIndicatorClass(p)}">${p}</span>`;
}

export function renderScreenDetails(model) {
  detailsScreenModel = model;

  detailsScreenModel.props.users$.subscribe((users) => {
    if (users.length > 0) {
      renderAssignees(users);
    }
  });

  const detailsTemplate = $("#detailsTemplate").html();
  const renderedHtml = detailsTemplate
    .replace(/{{title}}/gi, detailsScreenModel.itemForm.title)
    .replace(/{{description}}/gi, detailsScreenModel.itemForm.description)
    .replace(/{{assigneeName}}/gi, detailsScreenModel.itemForm.assigneeName);

  $("#detailsScreenContainer").html(renderedHtml);
  $("#imgAssigneeAvatar").attr(
    "src",
    detailsScreenModel.selectedAssignee.avatar
  );


  const selItemTypeOptions = detailsScreenModel.itemTypesProvider;
  $("#selItemType").kendoDropDownList({
    dataSource: selItemTypeOptions,
    value: detailsScreenModel.itemForm.typeStr,
    change: function(e) {
      detailsScreenModel.itemForm.typeStr = this.value();
      detailsScreenModel.notifyUpdateItem();
    },
    template: itemTypeTemplate
  })

  const selStatusOptions = detailsScreenModel.statusesProvider;

  $("#selStatus").kendoDropDownList({
    dataSource: selStatusOptions,
    value: detailsScreenModel.itemForm.statusStr,
    change: function(e) {
      const value = this.value();
      detailsScreenModel.itemForm.statusStr = value;
      detailsScreenModel.notifyUpdateItem();
    }
  });

  const selPriorityOptions = detailsScreenModel.prioritiesProvider;
  $("#selPriority").kendoDropDownList({
    dataSource: selPriorityOptions,
    value: detailsScreenModel.itemForm.priorityStr,
    change: function(e) {
      detailsScreenModel.itemForm.priorityStr = this.value();
      detailsScreenModel.notifyUpdateItem();
    },
    template: priorityTemplate
  });

$("#inputEstimate").kendoSlider({
  value: detailsScreenModel.itemForm.estimate,
  change: function(e) {
    detailsScreenModel.itemForm.estimate = this.value();
    detailsScreenModel.notifyUpdateItem();
  }
});
}

export function renderAssignees(users) {
  const listAssigneesObj = $("#listAssignees").empty();
  $.each(users, (key, u) => {
    listAssigneesObj.append(
      $(
        `
            <li class="list-group-item d-flex justify-content-between align-items-center pt-assignee-item" data-user-id="${u.id}" data-dismiss="modal">
                <span>${u.fullName}</span>
                <span class="badge ">
                    <img src="${u.avatar}" class="li-avatar rounded mx-auto d-block" />
                </span>
            </li>
            `
      )
    );
  });
}
