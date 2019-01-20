import { Component, OnInit } from '@angular/core';
import { House } from '../model/interfaces';
import { BackendServiceService } from './backend-service.service';

enum SortType {
  DISTANCE,
  MAX_ROOMS,
  NO_DATA
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {

  houses: House[];
  nearestHouses: House[];
  housesWithMoreThan5Rooms: House[];
  housesWithAllProperties: House[] = [];

  constructor(private backendService: BackendServiceService) { }

  ngOnInit() {
    this.backendService.getData().subscribe((data) => {
      this.houses = data.houses;
      this.setDistanceForAllHouses();
      this.nearestHouses = this.sortHousesByShortestDistance(this.houses, SortType.DISTANCE);
      console.log(' this.nearestHouses', this.nearestHouses);
      this.setSortedHousesWithMoreThan5Rooms();
      this.filterHousesByOwningProperties();
      console.log(this.housesWithAllProperties);
    });
  }

  filterHousesByOwningProperties(): void {
    this.houses.forEach((house) => {
      const stringifiedValue = JSON.stringify(house);
      if (this.stringHasAllProperites(stringifiedValue)) {
        this.housesWithAllProperties.push(house);
      }
    });
    this.housesWithAllProperties = this.sortHousesByShortestDistance(this.housesWithAllProperties, SortType.NO_DATA);
  }

  private stringHasAllProperites(stringifiedValue: string) {
    const hasAllProps = stringifiedValue.includes('"coords"') && stringifiedValue.includes('"params"') &&
      stringifiedValue.includes('"street"') && stringifiedValue.includes('"lat"') &&
      stringifiedValue.includes('"lon"') && stringifiedValue.includes('"rooms"') &&
      stringifiedValue.includes('"value"');
    if (hasAllProps) {
      return true;
    }
    return false;
  }

  sortHousesByShortestDistance(houses: House[], sortType: SortType) {
    houses.sort((house1, house2) => {
      return this.getSortCriteria(sortType, house1, house2) ? -1 : 1;
    });
    return houses;
  }


  private getSortCriteria(sortType: SortType, house1: House, house2: House): boolean {
    switch (sortType) {
      case (SortType.DISTANCE):
        return house1.distanceTo < house2.distanceTo;
      case (SortType.MAX_ROOMS):
        return house1.params.rooms < house2.params.rooms;
      case (SortType.NO_DATA):
        return house1.street < house2.street;
      default: return false;
    }
  }

  // calculates distance between Eberswalder Straße 55 and the other houses
  private setDistanceForAllHouses() {
    const punctZero: House = this.getHouseAtAddress(this.houses, 'Eberswalder Straße 55');
    this.houses.forEach((house) => {
      house.distanceTo = this.calculateDistance(house.coords.lat, house.coords.lon, punctZero.coords.lat,
        punctZero.coords.lon);
    });
  }


  private getHouseAtAddress(houses: House[], street: string): House {
    const foundHouse = houses.find((house) => {
      return house.street === street;
    });
    return foundHouse;
  }

  private calculateDistance(lat1: number, long1: number, lat2: number, long2: number) {
    const latDiff: number = lat1 - lat2;
    const longDiff: number = long1 - long2;

    return Math.sqrt(latDiff * latDiff + longDiff * longDiff);
  }


  setSortedHousesWithMoreThan5Rooms(): void {
    this.housesWithMoreThan5Rooms = this.sortHousesByShortestDistance(this.getHousesWithMoreThan5Rooms(), SortType.MAX_ROOMS);
    console.log('  this.housesWithMoreThan5Rooms: ', this.housesWithMoreThan5Rooms);
  }
  private getHousesWithMoreThan5Rooms(): House[] {
    const sad = this.houses.filter((house) => {
      if (!house.params || !house.params.rooms) {
        return false;
      }
      return house.params.rooms > 5;
    });
    return sad;
  }


}
