import { BehaviorSubject } from "rxjs";
import {Store} from "../core/state/app-store";
import { DashboardRepository } from "../core/services/dashboard.repository";
import { PtUserService } from "../core/services/pt-user-service";
import { DashboardService } from "../core/services/dashboard.service";

export class DashboardPageModel {
  constructor() {

    this.store = new Store();
    this.userService = new PtUserService(this.store);

    this.dashboardRepo = new DashboardRepository();
    this.dashboardService = new DashboardService(this.dashboardRepo);
    this.filter$ = new BehaviorSubject({});
    this.statusCounts$ = new BehaviorSubject(undefined);
    this.users$ = this.store.select("users");
    this.selectedUserIdStr = ""; 
  }

  onMonthRangeSelected(months) {
    const range = this.getDateRange(months);
    const userId = this.filter$.value
      ? this.filter$.value.userId
        ? this.filter$.value.userId
        : undefined
      : undefined;
    this.filter$.next({
      userId: userId,
      dateEnd: range.dateEnd,
      dateStart: range.dateStart,
    });
    this.refresh();
  }

  getDateRange(months) {
    const now = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);
    return {
      dateStart: start,
      dateEnd: now,
    };
  }

  refresh() {
    const filter = this.filter$.value;
    if (filter) {
      this.dashboardService.getStatusCounts(filter).then((result) => {
        this.statusCounts$.next(result);
      });
    }
  }

  usersRequested() {
    this.userService.fetchUsers();
  }

  userFilterValueChange() {
    if (this.selectedUserIdStr) {
      this.filter$.value.userId = Number(this.selectedUserIdStr);
    } else {
      this.filter$.value.userId = undefined;
    }
    this.refresh();
  }

}
