import { Component, OnInit } from '@angular/core';
import { House } from '../model/interfaces';
import { BackendServiceService } from './backend-service.service';

enum SortType {
  DISTANCE,
  MAX_ROOMS,
  NO_DATA
}

const ZERO_ZONE = 'Eberswalder Straße 55';

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
      this.setDistanceForAllHouses(ZERO_ZONE);
      this.nearestHouses = this.sortHousesBySortCriteria(this.houses, SortType.DISTANCE).slice(1);
      // console.log(' this.nearestHouses', this.nearestHouses);
      this.housesWithMoreThan5Rooms = this.getSortedHousesByNumberOfRooms(this.houses, 5);
      // console.log('  this.housesWithMoreThan5Rooms: ', this.housesWithMoreThan5Rooms);
      this.housesWithAllProperties = this.filterHousesByOwningProperties(this.houses);
      // console.log('housesWithAllProperties', this.housesWithAllProperties);
      this.calculateIdealHouse();
    });
  }

  private filterHousesByOwningProperties(houses: House[]): House[] {
    houses.forEach((house) => {
      const stringifiedValue = JSON.stringify(house);
      if (this.stringHasAllProperites(stringifiedValue)) {
        this.housesWithAllProperties.push(house);
      }
    });
    return this.sortHousesBySortCriteria(this.housesWithAllProperties, SortType.NO_DATA);
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

  private sortHousesBySortCriteria(houses: House[], sortType: SortType) {
    return houses.sort((house1, house2) => {
      return this.getSortCriteria(sortType, house1, house2) ? -1 : 1;
    });
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
  private setDistanceForAllHouses(street: string) {
    const punctZero: House = this.getHouseAtAddress(this.houses, street);
    this.houses.forEach((house) => {
      if (house.coords && house.coords.lat && house.coords.lon) {
        house.distanceTo = this.calculateDistance(house.coords.lat, house.coords.lon, punctZero.coords.lat,
          punctZero.coords.lon);
      }
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


  private getSortedHousesByNumberOfRooms(houses: House[], numberOfRooms: number): House[] {
    return this.sortHousesBySortCriteria(this.getHousesWithMoreThan5Rooms(houses, numberOfRooms), SortType.MAX_ROOMS);
  }
  private getHousesWithMoreThan5Rooms(houses: House[], numberOfRooms: number): House[] {
    return houses.filter((house) => {
      if (!house.params || !house.params.rooms) {
        return false;
      }
      return house.params.rooms > numberOfRooms;
    });
  }


  private getHousesCheaperOrEqalThanValue(houses: House[], value: number): House[] {
    return houses.filter((house) => {
      return house.params.value <= value;
    });
  }

  private calculateIdealHouse(): House {
    let canditates = this.filterHousesByOwningProperties(this.houses);
    canditates = this.getSortedHousesByNumberOfRooms(canditates, 10);
    canditates = this.sortHousesBySortCriteria(this.getHousesCheaperOrEqalThanValue(canditates, 5000000), SortType.DISTANCE);
    console.log('all: ', this.houses);
    console.log('canditates: ', canditates);
    console.log('result: ', canditates[0]);
    return canditates[0];
  }


}
