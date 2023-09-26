import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'departmentIcon'
})
export class DepartmentIconPipe implements PipeTransform {

  // religious_studies / torah_studies
  // http://localhost:4200/technion

  transform(value: any, arg: number) {
    if (value) {
      // const c = this.countries[this.countries.findIndex(y => y.name == value)];
      // return c ? c.code : '-';
      if (value.includes("Architecture")) {
        return 'department_general';
      } else if (value.includes("Chemistry")) {
        return 'chemistry';
      } else if (value.includes("Life") || value.includes("Biology")) {
        return 'life_sciences';
      } else if (value.includes("Math") || value.includes("Computer")) {
        return 'exact_sciences';
      } else if (value.includes("Physics")) {
        return 'physics';
      } else if (value.includes("Humanities") || value.includes("Education")) {
        return 'humanities';
      } else if (value.includes("Social")) {
        return 'social_sciences';
      } else if (value.includes("Interdisciplinary")) {
        return 'interdisciplinary_studies';
      } else if (
        value.includes("Electrical") || value.includes("Aerospace") || value.includes("Biotechnology") ||
        value.includes("Chemical") || value.includes("Industrial") || value.includes("Material") ||
        value.includes("Mechanical") || value.includes("Aerospace") || value.includes("Biomedical") ||
        value.includes("Civil")
      ) {
        return 'engineering';
      }
      return 'department_general';
    }
    return 'department_general';
  }
}
