import {
  Component,
  Input,
  ElementRef,
  OnInit,
  Host,
  Optional,
} from "@angular/core";

import { MapService } from "../map.service";
import { MapidService } from "../mapid.service";
import OlMap from "ol/Map";
import BookmarkCtrl from "ol-ext/control/GeoBookmark";
import Bar from "ol-ext/control/Bar";
import Toggle from "ol-ext/control/Toggle";
import TextButton from "ol-ext/control/TextButton";

import * as $ from "jquery";

import { Select, Draw } from "ol/interaction";
import { ZoomToExtent, Rotate, FullScreen } from "ol/control";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import GeometryType from "ol/geom/GeometryType";

/**
 * Add a control to the map
 * The control can be set inside the map (using parent id) or outside (using a mapId attribute)
 * @example
  <!-- Display a control inside a map -->
  <app-map>
    <app-control></app-control>
  </app-map>

  <!-- Display a control outside a map -->
  <app-control mapId="map"></app-control>
 */
@Component({
  selector: "app-control",
  template: "",
})
export class ControlComponent implements OnInit {
  /** Map id
   */
  @Input() mapId: string;

  /** Define the service
   */
  constructor(
    private mapService: MapService,
    @Host()
    @Optional()
    private mapidService: MapidService,
    private elementRef: ElementRef
  ) {}

  /** Add the control to the map
   */
  ngOnInit() {
    // Get the current map or get map by id
    const map: OlMap = this.mapService.getMap(this.mapidService || this.mapId);
    console.log(map.getView());

    //  Vector layer
    const vector = new VectorLayer({
      source: new VectorSource({ wrapX: false }),
    });

    // Insertar trazado
    map.addLayer(vector);

    // Get the target if outside the map
    const target = this.elementRef.nativeElement.parentElement
      ? this.elementRef.nativeElement
      : null;
    // Create the control
    const mark = new BookmarkCtrl({ target: target });
    const mainbar = new Bar();
    map.addControl(mark);
    map.addControl(mainbar);

    /* Nested toobar with one control activated at once */
    const nested = new Bar({ toggleOne: true, group: true });
    mainbar.addControl(nested);
    // Add selection tool (a toggle control with a select interaction)
    const selectCtrl = new Toggle({
      html: '<i class="fa fa-hand-pointer-o"></i>',
      className: "select",
      title: "Select",
      interaction: new Select(),
      active: true,
      onToggle: function (active) {
        // $("#info").text("Select is " + (active ? "activated" : "deactivated"));
        if (active) console.log("activado");
        else console.log("desactivado");
      },
    });
    nested.addControl(selectCtrl);

    // Add editing tools
    const pedit = new Toggle({
      html: '<i class="fa fa-map-marker" ></i>',
      className: "edit",
      title: "Point",
      interaction: new Draw({
        source: vector.getSource(),
        type: GeometryType.LINE_STRING,
        freehand: true,
      }),
      onToggle: function (active) {
        $("#info").text("Edition is " + (active ? "activated" : "deactivated"));
      },
    });
    nested.addControl(pedit);

    /* Standard Controls */
    mainbar.addControl(
      new ZoomToExtent({
        extent: [265971, 6243397, 273148, 6250665],
      })
    );
    mainbar.addControl(new Rotate());
    mainbar.addControl(new FullScreen());

    /* Nested subbar */
    const sub2 = new Bar({
      toggleOne: true,
      controls: [
        new TextButton({
          html: "2.1",
          handleClick: function (b) {
            // info("Button 2.1 clicked");
            console.log("Button 2.1 clicked");
          },
        }),
        new TextButton({
          html: "2.2",
          handleClick: function (b) {
            // info("Button 2.2 clicked");
            console.log("Button 2.2 clicked");
          },
        }),
      ],
    });

    const sub1 = new Bar({
      toggleOne: true,
      controls: [
        new Toggle({
          html: "1",
          // autoActivate: true,
          onToggle: (b) => {
            // info("Button 1 " + (b ? "activated" : "deactivated"));
            console.log("Button 1 " + (b ? "activated" : "deactivated"));
          },
        }),
        new Toggle({
          html: "2",
          onToggle: (b) => {
            // info("Button 2 " + (b ? "activated" : "deactivated"));
            console.log("Button 2 " + (b ? "activated" : "deactivated"));
          },
          // Second level nested control bar
          bar: sub2,
        }),
      ],
    });

    const nested2 = new Bar({
      controls: [
        new Toggle({
          html: "0",
          // First level nested control bar
          bar: sub1,
          onToggle: () => {
            // info("");
            console.log("Button 0 clicked");
          },
        }),
      ],
    });
    mainbar.addControl(nested2);

    // Show info
    // function info(i) {
    //   $("#info").html(i || "");
    // }
  }
}
