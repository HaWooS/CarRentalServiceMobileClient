import { OnInit, Component } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { filter, timestamp } from "rxjs/operators";
import { RadSideDrawer } from "nativescript-ui-sidedrawer";
import * as app from "tns-core-modules/application";
import { HomeComponent } from "./../home/home.component";

const appSettings = require("application-settings");
@Component({
    selector: "Register",
    templateUrl: "./register.component.html"
})

export class RegisterComponent implements OnInit {

    username: string;
    password: string;
    name: string;
    surname: string;
    address: string;
    private home: HomeComponent;
    private _activatedUrl: string;


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
        console.log("Wysylamy dane");
        let headers = new HttpHeaders({
            "Authorization": "Bearer",
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "DELETE, POST, GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With"
    });
        console.log("wysylam" + JSON.stringify({
        username: this.username,
        password: this.password,
        name: this.name,
        surname: this.surname,
        address: this.address
    }
    ));

        this.http.post('http://192.168.0.13:8080/register',
            JSON.stringify({
                username: this.username,
                password: this.password,
                name: this.name,
                surname: this.surname,
                address: this.address
            }
            ),
            { headers: headers }
        ).subscribe( res =>
            {
                if(res!=null)
                {
                    let options = {
                        title: "Konto zostalo pomyslnie utworzone",
                        message: "Teraz mozesz sie zalogowac",
                        okButtonText: "OK"
                    };
                    alert(options).then(() => {

                        console.log("Stworzono konto!");
                        this.routerExtensions.navigate(["/home"], {
                            transition: {
                                name: "fade"
                            }
                        });
                    })
                } else{
                    let options = {
                        title: "Rejestracja niepomyślna",
                        message: "Taki użytkownik istnieje",
                        okButtonText: "OK"
                    };
                    alert(options).then(() => {
                        console.log("Nie stworzono konta!");
                    })
                }


            }
            );



    }
    back(): void {
        this.routerExtensions.navigate(["/home"], {
            transition: {
                name: "fade"
            }
        });
    }
}
