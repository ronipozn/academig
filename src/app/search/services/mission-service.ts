import { Injectable } from '@angular/core';
import { Refinements} from '../../shared/services/shared-service';

@Injectable()
export class MissionService {
  query: string = '';

  jobFilters: number = 0;

  currentPage: number = 0;
  isLoading: boolean = true;
  totalRefinements: number[] = [0,0,0,0,0,0,0,0];
  hitsPerPage = 40;

  activeLink: string;

  refinements: Refinements = {
    "search_type": [],
    "type": [],
    "countries": [],
    "states": [],
    "cities": [],
    "universities": [],
    "disciplines": [],
    "interests": [],
    "positions": [],
    "size": [],
    "head": [],
    "types": [],
    "languages": [],
    "categories": [],
    "establish": null,
    "times": null,
    "shanghai": null,
    "top": null,
    "usnews": null,
    "facebook": null,
    "twitter": null,
    "linkedin": null,
    "instagram": null,
    "youtube": null
  }
}
