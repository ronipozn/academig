import {Component, OnInit} from '@angular/core';

export interface Highlight {
  name: string;
  pic: string;
  categories: string[];
  status: number;
  type: number;
  reduced_price: number;
  full_price: number;
  website: string;
  description: string;
}

const HighlightsData: Highlight[] = [
  {name: 'Benchling', pic: "https://www.benchling.com/wp-content/uploads/2019/04/Benchling-Preview.png", categories: [], status: 0, type: 1, reduced_price: 49, full_price: 600, website: "https://www.benchling.com/", description: "Benchling focuses on life science collaboration, both private and public."},
  {name: 'Rony', pic: "https://www.benchling.com/wp-content/uploads/2019/04/Benchling-Preview.png", categories: [], status: 1, type: 2, reduced_price: 69, full_price: 1200, website: "https://www.benchling.com/", description: "Rony focuses on life science collaboration, both private and public."},
];

@Component({
  selector: 'highlights',
  templateUrl: 'highlights.html',
  styleUrls: ['highlights.css']
})
export class SearchHighlightsComponent implements OnInit {
  highlights: Highlight[];

  statusTitles: string[] = ["Current", "Ending Soon", "Expired", "All"]
  typeTitles: string[] = ["Lifetime Deal", "Annual", "Freebie", "Subscription", "All Deal Types"]

  constructor() {}

  ngOnInit() {
    this.highlights = HighlightsData;
  }

}
