import {Component,OnInit,AfterViewInit} from '@angular/core'

@Component({
  moduleId: module.id,
  selector: 'google-feed-adsense',
  template: ` <div>
                <ins class="adsbygoogle"
                     style="display:inline-block;width:728px;height:60px"
                     data-ad-client="ca-pub-8976419141622665"
                     data-ad-slot="5688172963">
                </ins>
              </div>
            `,

})

export class AdFeedComponent implements AfterViewInit {
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
