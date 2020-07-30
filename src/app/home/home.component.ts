import { Component, OnInit } from "@angular/core";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { NavigationEnd, Router } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
import { filter, catchError } from "rxjs/operators";
import { HttpClient, HttpHandler } from "@angular/common/http";
import { HttpClientModule } from "@angular/common/http";
import { HttpHeaders, HttpResponse } from "@angular/common/http";
import { getFile, getImage, getJSON, getString, request, HttpResponseEncoding} from "tns-core-modules/http";
import { CssProperty } from "tns-core-modules/ui/page/page";
import { getLocaleNumberSymbol } from "@angular/common";
import { FeaturedComponent } from "../featured/featured.component";
import { FeaturedModule } from "../featured/featured.module";
import { RegisterComponent } from "../register/register.component";
const appSettings = require("application-settings");
@Component({
    selector: "Home",
    templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {

    username: string;
    password: string;
    private _activatedUrl: string;
    private featured: FeaturedComponent;
    private register: RegisterComponent;
    constructor(private router: Router, private routerExtensions: RouterExtensions, private http: HttpClient) {
      console.log("home component constructor");
        // Use the component constructor to inject providers.
    }
    ngOnInit(): void {
        // Init your component properties here.
        this.router.events
        .pipe(filter((event: any) => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => this._activatedUrl = event.urlAfterRedirects);
    }

    onDrawerButtonTap(): void {
        const sideDrawer = <RadSideDrawer>app.getRootView();
        sideDrawer.showDrawer();
    }

    onRegister(): void {
        console.log("NAWIGUJEMY");
        this.routerExtensions.navigate(["/register"], {
            transition: {
                name: "fade"
            }
        });
}
    onLogin(): void {
    let headers = new HttpHeaders({
            "Authorization": "Bearer",
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With"
    });
    let response = this.http.post('http://192.168.0.13:8080/authenticate',
        JSON.stringify({
            username: this.username,
            password: this.password
        }
        ),
        { headers: headers }
    ).subscribe( res => {
        if(res!=null){
            let data = JSON.stringify(res);
            let tokenresponse = JSON.parse(data);
            appSettings.setString("token" , "Bearer " + tokenresponse["token"]);
            appSettings.setString("username" , this.username);
            this.routerExtensions.navigate(["/featured"], {
              transition: {
                 name: "fade"
              }
            });
        }
        console.log("wysylam" + JSON.stringify({
        username: this.username,
        password: this.password
        }));
    },
    err=>{ let options = {
        title: "Wystąpił błąd",
        message: "Nie udało się zalogować",
        okButtonText: "OK"
    };
    alert(options).then(() => {
        console.log("Race chosen!");
    });}
    );
 }
}
