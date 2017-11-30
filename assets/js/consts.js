var storefrontApp = angular.module('storefrontApp');
storefrontApp.constant('itemResponseGroup', {
    None: 0,
    ItemInfo: 1,
    ItemAssets: 1 << 1,
    ItemProperties: 1 << 2,
    ItemAssociations: 1 << 3,
    ItemEditorialReviews: 1 << 4,
    Variations: 1 << 5,
    Seo: 1 << 6,
    Links: 1 << 7,
    Inventory: 1 << 8,
    Outlines: 1 << 9,
    ReferencedAssociations: 1 << 10,
    ItemWithPrices: 1 << 20,
    ItemWithDiscounts: 1 << 21,
    ItemWithVendor: 1 << 22,
    ItemWithPaymentPlan: 1 << 23,
    ItemSmall: this.ItemInfo | this.ItemAssets | this.Seo | this.Outlines,
    ItemMedium: this.ItemSmall | this.ItemProperties | this.ItemEditorialReviews,
    ItemLarge: this.ItemMedium | this.ItemAssociations | this.Variations | this.Inventory | this.ItemWithPrices | this.ItemWithDiscounts | this.ItemWithVendor | this.ItemWithPaymentPlan
});
