import {  OnInit, Injectable, resolveForwardRef } from "@angular/core";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
// tslint:disable-next-line: no-duplicate-imports
import { Component, ElementRef, ViewChild } from "@angular/core";
import { registerElement } from "nativescript-angular/element-registry";
import { MapView, Marker, Position } from "nativescript-google-maps-sdk";
import { HttpHeaders, HttpClient, HttpClientModule } from "@angular/common/http";
import * as Rx from "rxjs/Rx";
import { from, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { filter } from 'rxjs/operators';
import { RouterExtensions } from "nativescript-angular/router";
import { Router, NavigationEnd } from "@angular/router";
import { prompt, PromptResult, PromptOptions, inputType, capitalizationType } from "tns-core-modules/ui/dialogs";
const appSettings = require("application-settings");
const dialogs = require("tns-core-modules/ui/dialogs");
import { DataList } from "../datalist/datalist.component";
import { BrowseComponent } from "../browse/browse.component";
registerElement("MapView", () => MapView);
@Component({
    moduleId: module.id,
    selector: "Featured",
    templateUrl: "./featured.component.html"

})
@Injectable()
export class FeaturedComponent implements OnInit {
    latitude =  50.8682003;
    longitude = 20.6276014;
    zoom = 15.5;
    minZoom = 10;
    maxZoom = 22;
    bearing = 0;
    tilt = 0;
    padding = [40, 40, 40, 40];
    mapView: MapView;
    lastCamera: String;
    cars : [];
    public browse: BrowseComponent;
    private _activatedUrl: string;

    // tslint:disable-next-line: max-line-length
    constructor(private dataList: DataList, private router: Router, private routerExtensions: RouterExtensions, public http: HttpClient) {
        // Use the component constructor to inject providers.
    }

    // tslint:disable-next-line: member-ordering
   // @ViewChild("MapView", {static: false}) mapView: ElementRef;

    ngOnInit(): void {
    this.router.events
    .pipe(filter((event: any) => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => this._activatedUrl = event.urlAfterRedirects);
    console.log("TOKEN JEST "+appSettings.getString("token"));
    this.getCars();
    this.getUserData();
    console.log("INIT FEATURE");
}

    onDrawerButtonTap(): void {
        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.showDrawer();
    }
  // Map events
    onMapReady(event) {
    this.getCars();
    console.log("Map Ready");
    this.getGlobals();
    if(this.dataList.getReservationPosibility === true) {
        dialogs.alert({
            title: "Wybierz pojazd",
            message: "",
            okButtonText: "Zrozumialem"
        }).then(function() {console.log("dialog close"); });
        this.mapView = event.object;

        console.log("Setting a marker...");
        this.cars.forEach(car => {
            let marker = new Marker();
            marker.position = Position.positionFromLatLng(car["latitude"],car["longitude"]);
            marker.userData = {index: 1, car_id: car["id"], deposit:car["deposit"], register_number:car["register_number"]};
            this.mapView.addMarker(marker);
        });
    }else{
        let options = {
            title: "Aktualnie wynajmujesz pojazd",
            message: "Aby wynająć kolejny oddaj obecny",
            okButtonText: "OK"
        };
        alert(options).then(() => {
            console.log("Race chosen!");
            this.routerExtensions.navigate(["/browse"], {
                transition: {
                    name: "fade"
                }
            });
        });



        }
}

    onCoordinateTapped(args) {
        //console.log("Coordinate Tapped, Lat: " + args.position.latitude + ", Lon: " + args.position.longitude, args);
    }

    onMarkerEvent(args) {
        console.log("Marker Event: '" + args.eventName
            + "' triggered on: " + args.marker.title
            + ", Lat: " + args.marker.position.latitude + ", Lon: " + args.marker.position.longitude, args);
        console.log("Kliknalem marker o id " + args.marker.userData.car_id);
        let options: any = {
        title:"Wybierasz pojazd o id" + args.marker.userData.car_id,
        message: "Kaucja wynosi zł: " + args.marker.userData.deposit + " Nr rejestracji " + args.marker.userData.register_number,
        okButtonText: "Potwierdź",
        cancelButtonText: "Anuluj"
    };
        confirm(options).then((result: boolean) => {
        if(result === true){
            console.log("dialog close");
            appSettings.setNumber("id", args.marker.userData.car_id);
            appSettings.setNumber("deposit", args.marker.userData.deposit);
            console.log("REZERWACJA AUTA ");
            console.log("ID" + appSettings.getNumber("id"));
            console.log("DEPOZYT" + appSettings.getNumber("deposit"));
            console.log("USERNAME" + appSettings.getString("username"));
            this.mapView.removeMarker(args.marker);

            let options1: PromptOptions = {
                title: "Wporwadź na ile dni chcesz wynająć pojazd",
                defaultText: "",
                okButtonText: "OK",
                inputType: inputType.text,
                cancelable: false,
                 // email, number, text, password, or email
                capitalizationType: capitalizationType.sentences // all. none, sentences or words
            };

            prompt(options1).then((result: PromptResult) => {
                this.reserveCar();
                appSettings.setString("days", result.text);
                console.log("Hello, " + result.text);
            });

        } else {
            console.log(result);
        }
    });

    }

    onCameraChanged(args) {
        //console.log("Camera changed: " + JSON.stringify(args.camera), JSON.stringify(args.camera) === this.lastCamera);
        this.lastCamera = JSON.stringify(args.camera);
    }

    onCameraMove(args) {
        //console.log("Camera moving: " + JSON.stringify(args.camera));
    }

    getCars(): void {
        let headers = new HttpHeaders({
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
            "Authorization" : appSettings.getString("token")
    });
        let options: any = {
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
                "Authorization" : "Bearer " + appSettings.getString("token")
            }
        }
        let tmp;
        this.http.get("http://192.168.0.13:8080/availableCars",
         {headers:headers}).subscribe((response) =>{
            tmp=response;
            this.cars=tmp;
         }
         );
}
    getGlobals(): void {
    let headers = new HttpHeaders({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
    "Authorization" : appSettings.getString("token")
    });
    this.http.get("http://192.168.0.13:8080/getFuelCost",
    { headers: headers })
    .subscribe( res => {
    let data = JSON.stringify(res);
    let fuelModel = JSON.parse(data);
    console.log(fuelModel);
    console.log("weszlo");
    appSettings.setNumber("fuel" , fuelModel["price"]);
    console.log("try");
    console.log("pobrana cena paliwa " + appSettings.getNumber("fuel"));
    this.dataList.setPrice=appSettings.getNumber("fuel").toPrecision(3);
    console.log("Cena paliwa z modelu to " + this.dataList.getPrice);
    });
}

    getUserData(): void {
    console.log(" WOLAM USER DATA Z KOMPONENTU FEATURED ");
    let headers = new HttpHeaders({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
        "Authorization" : appSettings.getString("token")
        });
    this.http.get("http://192.168.0.13:8080/getRentsForSingleUser",
    { headers: headers})
    .subscribe(res => {
        console.log("mamy resa");
        console.log(res);
        if(res!=null){
            console.log("bez nulla ;/ ");
            this.dataList.setReservationPossibility = false;
            this.dataList.setId=res["car_id"];
            this.dataList.setStart_date=res["start_date"];
            this.dataList.setEnd_date=res["end_date"];
            this.dataList.setDeposit=res["deposit"];
            this.dataList.setBox_code=res["box_code"];
            this.dataList.setCost=res["rent_cost"];
            this.dataList.price=res["fuel_cost"];
        } else {
            console.log("poszedl null z pytania o mozliwosc  rezerwacji");
            console.log(res);
            this.dataList.setReservationPossibility = true;
        }
    });
}

    reserveCar(): void {
    let headers = new HttpHeaders({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With",
        "Authorization" : appSettings.getString("token")
        });
    let response = this.http.post("http://192.168.0.13:8080/reserveCar",
    JSON.stringify({
        id: appSettings.getNumber("id"),
        deposit: appSettings.getNumber("deposit"),
        username: appSettings.getString("username"),
        fuel_cost: this.dataList.getPrice,
        rent_days: appSettings.getString("days")
    }),
    { headers: headers })
    .subscribe(res => {
        if(res!=null){
            appSettings.setString("start_date",res["start_date"]);
            appSettings.setString("end_date",res["end_date"]);
            let options = {
                title: "Rezerwacja przebiegła pomyśnie",
                message: "Masz 5 minut na opłacenie kaucji",
                okButtonText: "OK"
            };
            alert(options).then(() => {
                this.dataList.setId = appSettings.getNumber("id");
                this.dataList.setStart_date = appSettings.getString("start_date");
                this.dataList.setEnd_date = appSettings.getString("end_date");
                this.dataList.setDeposit = appSettings.getNumber("deposit");
                this.routerExtensions.navigate(["/browse"], {
                    transition: {
                        name: "fade"
                    }
                });
            });
        }else{
            let options = {
                title: "Niestety toś cie uprzedził",
                message: "Spróbuj zarezerwować inny pojazd",
                okButtonText: "OK"
            };
            alert(options);
        }
    });

}
}
