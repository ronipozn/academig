import {Component,OnInit,AfterViewInit} from '@angular/core'

@Component({
  moduleId: module.id,
  selector: 'google-adsense',
  template: ` <div>
                <ins class="adsbygoogle"
                     style="display:inline-block;height:290px;width:290px"
                     data-ad-client="ca-pub-8976419141622665"
                     data-ad-slot="7533995967">
                </ins>
              </div>
            `,

})

export class AdComponent implements AfterViewInit {

  // 2945084155
  // data-ad-layout-key="-6q+c8+7-4b+o2"

  constructor() { }

  ngAfterViewInit() {
    setTimeout(()=>{
      try{
        (window['adsbygoogle'] = window['adsbygoogle'] || []).push({});
      }catch(e){
        console.error("error",e);
      }
    },2000);
  }
}
