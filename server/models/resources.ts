export { Core, Code, Inventory, Equipment, Resource, ResourceDetails, Category, Price, Request };

import { objectMini, groupComplex, Link } from './shared.ts';
import { FAQ } from './faqs.ts';

interface Core {
    name: string,
    version: string,
    date: Date,
    description: string,
    files: string[]
}

interface Code extends Core {
    name: string,
    version: string,
    date: Date,
    description: string,
    git: string,
    files: string[]
}

interface Inventory {
    pic: string,
    name: string,
    description: string,
    vendor: string,
    model: string,
    price: string,
    quantity: string,
    link: string,
    files: string[]
}

interface Equipment {
    pic: string,
    name: string,
    description: string,
    manufacturer: string,
    model: string,
    price: string,
    link: string,
    files: string[]
}

interface Resource {
    _id: string,
    group: groupComplex,
    name: string,
    pic: string,
    views: number[],
    followStatus: boolean
}

interface ResourceDetails {
    _id: string,
    group: groupComplex,

    name: string,

    created_on: Date,
    views: number[],
    downloads: number[],
    followStatus: boolean,

    people: objectMini[],
    projects: objectMini[],
    tags: string[],

    background: string,
    backgroundPic: string,

    description: string,
    termsMode: number,
    termsMore: string,
    publicationsIds: number[],
    gallery: objectMini[],
    links: Link[],
    faqs: FAQ[],
    manuals: Core[],
    codes: Code[],
    cads: Core[],
    inventories: Inventory[],
    equipments: Equipment[]
}

interface Category {
    _id: number,
    title: string,
    countIds: number
}

interface Price {
    request: boolean,
    type: boolean,
    range: boolean,
    price: number[],
    mode: number,
    currency: number,
    internalId: string
}

interface Request {
    channelId: string,
    date: Date,
    userId: string
}
