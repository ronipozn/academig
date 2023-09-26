import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

import {APP_BASE_HREF} from '@angular/common';

import {PublicInfo, SocialInfo, objectMini, Affiliation} from './shared-service';

import {UserService} from '../../user/services/user-service';
import {AuthService} from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UniversityService {

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}
  // @Optional() @Inject(APP_BASE_HREF) origin: string

  async getUniversityByURL(universityUrl: string): Promise<any> {
    return this.http.get('/api/' + universityUrl)
           .toPromise().catch(this.handleError('getUniversityByURL', null));
  }

  async getUniversities(text: string, id: number, state: string, city: string, mode: number): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/getUniversities?mode=' + mode + '&city=' + city + '&state=' + state + '&id=' + id, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getUniversities', []));
  }

  async queryUniversities(query: string = null): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/queryUniversities?query=' + query, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('queryUniversities', []));
  }

  async getUniversityAccount(universityId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.get('/api/universityAccount?id=' + universityId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getUniversityAccount', []));
  }

  async getContactsPage(universityId: string): Promise<any> {
    return this.http.get('/api/getContactsPage?mode=0&id=' + universityId)
           .toPromise().catch(this.handleError('getContactsPage', []));
  }

  async postRank(rank: Rank, universityId: string, mode: number): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/univeristyRank.json?id=' + universityId + '&mode=' + mode, rank, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postRank', []));
  }

  async deleteUniversity(universityId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/university.json?id=' + universityId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteUniversity', []));
  }

  ///////////////////////////////////
  ///////////////////////////////////
  ///////////////////////////////////
  ///////////////////////////////////

  async getDepartments(universityId: string, query: string = null): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/getDepartments?mode=1&id=' + universityId + '&query=' + query, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getDepartments', []));
  }

  async getUnitsAndDepartments(universityId: string): Promise<any> {
    var token = null;

    if (this.userService.userId) {
      const client = await this.authService.getAuth0Client();
      token = await client.getTokenSilently();
    }

    return this.http.get('/api/getDepartments?mode=0&id=' + universityId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('getUnitsAndDepartments', []));
  }

  async putDepartment(department: CreateDepartment, universityId: string, itemId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/department.json?id=' + universityId + '&itemId=' + itemId, department, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putDepartment', []));
  }

  async postDepartment(universityId: string, departmentId: string, itemId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/department.json?id=' + universityId + '&departmentId=' + departmentId, {"itemId": itemId}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postDepartment', []));
  }

  async putUnit(name: string, icon: number, universityId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.put('/api/univeristyUnit.json?id=' + universityId, {'name': name, 'icon': icon}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('putUnit', []));
  }

  async postUnit(name: string, icon: number, itemId: string, universityId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.post('/api/univeristyUnit.json?id=' + universityId, {'id': itemId, 'name': name, 'icon': icon}, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('postUnit', []));
  }

  async deleteUnit(itemId: string, universityId: string): Promise<any> {
    const client = await this.authService.getAuth0Client();
    const token = await client.getTokenSilently();

    return this.http.delete('/api/univeristyUnit.json?id=' + universityId + '&itemId=' + itemId, { headers: { Authorization: `Bearer ${token}` } })
           .toPromise().catch(this.handleError('deleteUnit', []));
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * param operation - name of the operation that failed
   * param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): T => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return (result as T);
    };
  }

  private log(message: string) { }
}

export class universityAccount {
  constructor(
    public stage: number,
    public description: string,
    public source: string,
    public externalLink: string,
    public rank: Rank,
    // public dates: Date[],
    // public departmentsCount: string,
    ) {
    }
}

export class Unit {
  constructor(
    public id: string,
    public name: string,
    public icon: number,
    public empty: boolean) {
    }
}

export class Rank {
  constructor(
    public times: number,
    public shanghai: number,
    public top: number,
    public usnews: number,
    public facebook: number,
    public twitter: number,
    public linkedin: number,
    public instagram: number,
    public youtube: number) {
    }
}

export class Department {
  constructor(
    public _id: string,
    public categoryId: string,
    public name: string,
    public link: string,
    public pic: string) {
    }
}

export class CreateDepartment {
  constructor(
    public name: string,
    public link: string,
    public pic: string,
    public website: string,
    public description: string,
    public source: string) {
    }
}

export class University {
  constructor(
    public _id: string,
    public name: string,
    public link: string,
    public pic: string,
    public externalLink: string,
    public description: string,
    public source: string,
    public counters: number[],
    public pics: objectMini[],
    public country: number,
    public state: string,
    public city: string,
    public location: number[],
    public publicInfo: PublicInfo,
    public socialInfo: SocialInfo) {
    }
}

export class queryUniversity {
  constructor(
    public _id: string,
    public academigId: string,
    public name: string,
    public url: string) {
    }
}

export class departmentsItems {
  constructor(
    public categories: Unit[],
    public departments: Department[]) {
    }
}

export class contactsPageItems {
  constructor(
    public findUs: string,
    public findUsPic: string,
    public findUsCaption: string) {
    }
}

export let Departments = [
{"name": "Accounting"},
{"name": "Accounting Law"},
{"name": "Acoustic Engineering"},
{"name": "Advertising"},
{"name": "Aerobiology"},
{"name": "Aerospace Engineering"},
{"name": "Aesthetics"},
{"name": "African-American Literature"},
{"name": "Africana Studies"},
{"name": "Agricultural Economics"},
{"name": "Agricultural Engineering"},
{"name": "Agriculture"},
{"name": "Agriculture Sciences"},
{"name": "Agrology"},
{"name": "Air Force Studies"},
{"name": "American Literature"},
{"name": "American Studies"},
{"name": "Analytical Chemistry"},
{"name": "Anatomy"},
{"name": "Ancient History"},
{"name": "Animal Science"},
{"name": "Anthropology"},
{"name": "Applied Health Sciences"},
{"name": "Applied Mathematics"},
{"name": "Aquaculture"},
{"name": "Archaeology"},
{"name": "Architectural Engineering"},
{"name": "Architecture"},
{"name": "Architecture And Environmental Design"},
{"name": "Art"},
{"name": "Art History"},
{"name": "Artificial Intelligence"},
{"name": "Artillery"},
{"name": "Astronomy"},
{"name": "Astrophysics"},
{"name": "Atomic, Molecular, And Optical Physics"},
{"name": "Australian Literature"},
{"name": "Automotive Systems Engineering"},
{"name": "Beekeeping (Apiculture)"},
{"name": "Behavioural Psychology"},
{"name": "Biochemistry"},
{"name": "Biodiversity And Forest"},
{"name": "Bioengineering"},
{"name": "Bioinformatics"},
{"name": "Biological Anthropology"},
{"name": "Biology"},
{"name": "Biomaterials Engineering"},
{"name": "Biomedical Engineering"},
{"name": "Biophysics"},
{"name": "Black Studies"},
{"name": "Botany"},
{"name": "Brain Sciences"},
{"name": "British Literature"},
{"name": "Broadcast Journalism"},
{"name": "Business"},
{"name": "Business Ethics"},
{"name": "Campaigning"},
{"name": "Canadian Literature"},
{"name": "Cardiology"},
{"name": "Catholic Studies"},
{"name": "Cell Biology"},
{"name": "Ceramic Engineering"},
{"name": "Chemical Engineering"},
{"name": "Chemical Technology And Engineering"},
{"name": "Chemistry"},
{"name": "Chemistry And Chemical Technology"},
{"name": "Chinese Studies"},
{"name": "Choreography"},
{"name": "Christology"},
{"name": "Chronobiology"},
{"name": "City Planning"},
{"name": "Civil Engineering"},
{"name": "Cognitive Psychology"},
{"name": "Cognitive Science"},
{"name": "Combat Engineering"},
{"name": "Communications"},
{"name": "Computational Chemistry"},
{"name": "Computational Physics"},
{"name": "Computer Engineering"},
{"name": "Computer Science"},
{"name": "Computer-Mediated Communications"},
{"name": "Condensed Matter Physics"},
{"name": "Constitutional Law"},
{"name": "Consumer Education"},
{"name": "Contemporary History"},
{"name": "Continental Philosophy"},
{"name": "Control Science And Engineering"},
{"name": "Control Systems Engineering"},
{"name": "Cosmogony"},
{"name": "Creative Writing"},
{"name": "Criminal Justice"},
{"name": "Criminal Law"},
{"name": "Crop Breeding & Genetics"},
{"name": "Cryobiology"},
{"name": "Cryogenics"},
{"name": "Cryptozoology"},
{"name": "Cultural Anthropology"},
{"name": "Cultural Geography"},
{"name": "Cultural Studies"},
{"name": "Dance"},
{"name": "Dental Hygiene"},
{"name": "Dentistry"},
{"name": "Destination/Coastal Architects"},
{"name": "Developmental Psychology"},
{"name": "Differential Psychology"},
{"name": "Diplomatic History"},
{"name": "Earth Science"},
{"name": "Eastern European Studies"},
{"name": "Eastern Philosophy"},
{"name": "Ecology"},
{"name": "Economics"},
{"name": "Education"},
{"name": "Educational Administration"},
{"name": "Educational Psychology"},
{"name": "Educational Technology"},
{"name": "Electrical Engineering"},
{"name": "Electronic Engineering"},
{"name": "Elementary Education"},
{"name": "Endocrinology And Diabetology"},
{"name": "Endodontics"},
{"name": "Engineering"},
{"name": "Engineering And Architecture"},
{"name": "Engineering Physics"},
{"name": "English Literature"},
{"name": "English Studies"},
{"name": "Entomology"},
{"name": "Environmental Engineering"},
{"name": "Environmental Law"},
{"name": "Environmental Science"},
{"name": "Epidemiology"},
{"name": "Epistemology"},
{"name": "Ethnic Studies"},
{"name": "Ethnochoreology"},
{"name": "Ethnology"},
{"name": "Ethnomusicology"},
{"name": "European History"},
{"name": "Evolutionary Biology"},
{"name": "Experimental Psychology"},
{"name": "Family And Consumer Science"},
{"name": "Film Studies"},
{"name": "Finance"},
{"name": "Folklore"},
{"name": "Food Technology"},
{"name": "Foodservice Management"},
{"name": "Forensics"},
{"name": "Forestry"},
{"name": "French Literature"},
{"name": "Gaelic Literature"},
{"name": "Game Theory"},
{"name": "Gender Studies"},
{"name": "Genetics"},
{"name": "Geodesy"},
{"name": "Geography"},
{"name": "Geology"},
{"name": "Geomorphology"},
{"name": "Geophysics"},
{"name": "Geriatrics"},
{"name": "German Literature"},
{"name": "Gerontology"},
{"name": "Glaciology"},
{"name": "Health Sciences"},
{"name": "Hematology"},
{"name": "Herpetology"},
{"name": "Hindi Literature"},
{"name": "Historical Anthropology"},
{"name": "History"},
{"name": "History Of Art"},
{"name": "History Of Dance"},
{"name": "History Of Philosophy"},
{"name": "History Of Science And Technology"},
{"name": "Home Economics"},
{"name": "Horticulture"},
{"name": "Hotel Administration"},
{"name": "Housing"},
{"name": "Human Anatomy"},
{"name": "Human Biology"},
{"name": "Human Development Theory"},
{"name": "Human Ecology"},
{"name": "Human Factors And Ergonomics"},
{"name": "Human Geography"},
{"name": "Human Medicine"},
{"name": "Human Resources"},
{"name": "Humanities And Arts"},
{"name": "Hydraulic And Environmental Engineering"},
{"name": "Ichthyology"},
{"name": "Indian Literature"},
{"name": "Industrial And Labor Relations"},
{"name": "Industrial Engineering"},
{"name": "Industrial Sociology"},
{"name": "Information Science"},
{"name": "Information Systems"},
{"name": "Information Theory"},
{"name": "Inorganic Chemistry"},
{"name": "Interior Design"},
{"name": "Internal Medicine"},
{"name": "International And Comparative Labor"},
{"name": "International Law"},
{"name": "International Relations"},
{"name": "Interpersonal Communications"},
{"name": "Intrapersonal Communications"},
{"name": "Irish Literature"},
{"name": "Irish Studies"},
{"name": "Islamic History"},
{"name": "Islamic Jurisprudence"},
{"name": "Islamic Law"},
{"name": "Islamic Studies"},
{"name": "Jazz Studies"},
{"name": "Jewish Studies"},
{"name": "Joint Warfare Studies"},
{"name": "Journalism"},
{"name": "Jurisprudence"},
{"name": "Kabbalah"},
{"name": "Koran"},
{"name": "Labor Economics"},
{"name": "Labor History"},
{"name": "Labor Law"},
{"name": "Landscape Archiecture"},
{"name": "Languages And Literature"},
{"name": "Latin American Studies"},
{"name": "Latino/Latina Studies"},
{"name": "Law"},
{"name": "Leadership"},
{"name": "Life Sciences (Biology)"},
{"name": "Limnology"},
{"name": "Linguistics"},
{"name": "Literary And Cultural Studies"},
{"name": "Literary Criticism"},
{"name": "Literary Theory"},
{"name": "Literature Of Languages Or Cultures"},
{"name": "Logistics"},
{"name": "Macroeconomics"},
{"name": "Management"},
{"name": "Manufacturing"},
{"name": "Manufacturing And Mechatronic"},
{"name": "Marine Biology"},
{"name": "Marine Engineering"},
{"name": "Marketing"},
{"name": "Marketing And Tourism"},
{"name": "Materials Engineering"},
{"name": "Materials Science And Engineering"},
{"name": "Mathematics"},
{"name": "Mathematics And Computer Science"},
{"name": "Mechanical And Automotive Engineering"},
{"name": "Mechanical And Energy Engineering"},
{"name": "Mechanical Engineering"},
{"name": "Media Studies"},
{"name": "Medical Genetics"},
{"name": "Medical Sciences"},
{"name": "Medicine And Health"},
{"name": "Metallurgical Engineering"},
{"name": "Metaphysics"},
{"name": "Meteorology"},
{"name": "Microbiology"},
{"name": "Microbiology And Parasitology"},
{"name": "Microeconomics"},
{"name": "Microelectronics And Semiconductor Engineering"},
{"name": "Middle School Education"},
{"name": "Midrash"},
{"name": "Military Science"},
{"name": "Mineral Resources Engineering"},
{"name": "Mineralogy"},
{"name": "Modern Hebrew Literature"},
{"name": "Molecular Biology"},
{"name": "Molecular Biology And Genetics"},
{"name": "Moral Theology"},
{"name": "Morphology"},
{"name": "Music"},
{"name": "Music Education"},
{"name": "Music History"},
{"name": "Music Theory"},
{"name": "Music Theory Pedagodgy"},
{"name": "Musical Composition"},
{"name": "Musicology"},
{"name": "Mycology"},
{"name": "Mystical Theology"},
{"name": "Mythology"},
{"name": "Native American Studies"},
{"name": "Naval Architecture"},
{"name": "Naval Engineering"},
{"name": "Naval Science"},
{"name": "Nephrology"},
{"name": "Neurology"},
{"name": "Neuropsychology"},
{"name": "Neuroscience"},
{"name": "Neurosurgery"},
{"name": "New Media Journalism"},
{"name": "New Zealand Literature"},
{"name": "Northern Ireland Literature"},
{"name": "Nuclear Engineering"},
{"name": "Nuclear Physics"},
{"name": "Nursing"},
{"name": "Nutrition"},
{"name": "Ocean Engineering"},
{"name": "Oceanography"},
{"name": "Oology"},
{"name": "Optical Engineering"},
{"name": "Optics"},
{"name": "Optometry"},
{"name": "Orchestral Conducting"},
{"name": "Orchestral Studies"},
{"name": "Organic Chemistry"},
{"name": "Organisational Psychology"},
{"name": "Organizational Behavior"},
{"name": "Ornithology"},
{"name": "Orthodontics"},
{"name": "Paleontology"},
{"name": "Parapsychology"},
{"name": "Parks And Recreation Management"},
{"name": "Particle Physics"},
{"name": "Pathology"},
{"name": "Pedagogy"},
{"name": "Pediatrics"},
{"name": "Pediodontics"},
{"name": "Pedology"},
{"name": "Performance And Literature"},
{"name": "Periodontics"},
{"name": "Petroleum Engineering"},
{"name": "Pharmacy"},
{"name": "Philosophy"},
{"name": "Philosophy Of Language"},
{"name": "Philosophy Of Law"},
{"name": "Philosophy Of Mathematics"},
{"name": "Philosophy Of Mind"},
{"name": "Philosophy Of Religion"},
{"name": "Philosophy Of Science"},
{"name": "Phonology"},
{"name": "Phycology"},
{"name": "Physical Chemistry"},
{"name": "Physics"},
{"name": "Physiology"},
{"name": "Physiology And Pathophysiology"},
{"name": "Piano"},
{"name": "Planetary Science"},
{"name": "Plant Science"},
{"name": "Plasma Physics"},
{"name": "Poetics"},
{"name": "Poetry Composition"},
{"name": "Police Science"},
{"name": "Political Science"},
{"name": "Polymer Engineering"},
{"name": "Primatology"},
{"name": "Prosthodontics"},
{"name": "Psychiatry"},
{"name": "Psychoanalysis"},
{"name": "Psychology"},
{"name": "Public Administration"},
{"name": "Public Affairs"},
{"name": "Public Affairs And Community Service"},
{"name": "Public Diplomacy"},
{"name": "Public Health"},
{"name": "Public Relations"},
{"name": "Pure Mathematics"},
{"name": "Quality Assurance Engineering"},
{"name": "Queer Studies"},
{"name": "Radio & Electronic"},
{"name": "Religious Studies"},
{"name": "Rheumatology"},
{"name": "Robotics"},
{"name": "Rural Sociology"},
{"name": "Russian Studies"},
{"name": "Safety Engineering"},
{"name": "Science And Technology Studies"},
{"name": "Scottish Literature"},
{"name": "Secondary Education"},
{"name": "Sedimentology"},
{"name": "Semantics"},
{"name": "Semiotics"},
{"name": "Social Psychology"},
{"name": "Social Sciences"},
{"name": "Social Theory"},
{"name": "Social Work"},
{"name": "Sociology"},
{"name": "Software Engineering"},
{"name": "Soil And Environmental Sciences"},
{"name": "Soil Science"},
{"name": "Space Sciences"},
{"name": "Spanish Literature"},
{"name": "Special Operations And Low Intensity Conflict"},
{"name": "Speech Communications"},
{"name": "Statistics"},
{"name": "Studio Art"},
{"name": "Surgery"},
{"name": "Systems Science"},
{"name": "Talmud"},
{"name": "Tax Law"},
{"name": "Telecommunications"},
{"name": "Telecommunications Engineering"},
{"name": "Textiles"},
{"name": "Theology"},
{"name": "Theoretical Chemistry"},
{"name": "Topology"},
{"name": "Transportation Engineering"},
{"name": "Urban Planning"},
{"name": "Urban Studies"},
{"name": "Vehicle Dynamics"},
{"name": "Veterinary Medicine"},
{"name": "Weapons Systems"},
{"name": "Welsh Literature"},
{"name": "Women Studies"},
{"name": "Xenobiology"},
{"name": "Yiddish Literature"},
{"name": "Zoology"},
{"name": "Zootomy"},
]
