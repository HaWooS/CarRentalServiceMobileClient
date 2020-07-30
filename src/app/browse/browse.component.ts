import { Component, OnInit } from "@angular/core";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { DataList } from "../datalist/datalist.component";
import * as observable from 'tns-core-modules/data/observable';
import * as pages from 'tns-core-modules/ui/page';
import { HttpHeaders, HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
const appSettings = require("application-settings");
@Component({
    selector: "Browse",
    templateUrl: "./browse.component.html"
})
export class BrowseComponent implements OnInit {

    // tslint:disable-next-line: max-line-length
    constructor(private router: Router, private routerExtensions: RouterExtensions,public dataList: DataList, public http: HttpClient) {
        // Use the component constructor to inject providers.

    }

    ngOnInit(): void {
        // Init your component properties here.
    }

    onDrawerButtonTap(): void {
        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.showDrawer();
    }

    payDeposit(): void {
        console.log(" w komponencie id to "+ this.dataList.getId);
        console.log(" w komponencie start data to "+ this.dataList.getStart_date);
        let headers = new HttpHeaders({
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
            "Authorization" : appSettings.getString("token")
            });
        this.http.post("http://192.168.0.13:8080/payDeposit",
            JSON.stringify({
                id: this.dataList.getId,
                start_date: this.dataList.getStart_date
            }),
            { headers: headers }
        ).subscribe( res =>{
            if(res!=null)
            {
                this.dataList.setBox_code = res["box_code"];
                this.routerExtensions.navigate(["/browse"], {
                    transition: {
                        name: "fade"
                    }
                });
            }
        });
    }
    giveBackCar(): void {
        let headers = new HttpHeaders({
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
            "Authorization" : appSettings.getString("token")
            });
        this.http.post("http://192.168.0.13:8080/returnCar",
            JSON.stringify({
                car_id: this.dataList.getId,
                start_date: this.dataList.getStart_date,
                end_date: this.dataList.getEnd_date
            }),
            { headers: headers }
        ).subscribe( res =>{
            if(res!=null)
            {
                this.dataList.cost = res["cost"];
                this.routerExtensions.navigate(["/browse"], {
                    transition: {
                        name: "fade"
                    }
                });
            }
        });
    }
    payCharge(): void {
        let headers = new HttpHeaders({
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
            "Authorization" : appSettings.getString("token")
            });
        this.http.post("http://192.168.0.13:8080/confirmPayment",
            JSON.stringify({
                id: this.dataList.getId,
                start_date: this.dataList.getStart_date,
                end_date: this.dataList.getEnd_date,
                username: appSettings.getString("username")
            }),
            { headers: headers }
        ).subscribe( res =>{
            console.log("wyslalem "+  JSON.stringify({
                car_id: this.dataList.getId,
                start_date: this.dataList.getStart_date,
                end_date: this.dataList.getEnd_date,
                username: appSettings.getString("username")
            }));
            if(res!=null)
            {
                let status=res["status"].toString();
                let expectedStatus="success";
                console.log("STATUSIK "+status);
                if(status === expectedStatus) {
                    delete this.dataList.id;
                    delete this.dataList.start_date;
                    delete this.dataList.end_date;
                    delete this.dataList.deposit;
                    delete this.dataList.box_code;
                    delete this.dataList.cost;
                    this.routerExtensions.navigate(["/browse"], {
                    transition: {
                        name: "fade"
                    }
                });

                }else{
                    console.log("Nie udalo sie oplacic należności za pojazd");
                }
            }
        });
    }
}
