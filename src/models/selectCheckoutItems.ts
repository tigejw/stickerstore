import { selectProductById } from "./selectProductById";
import { selectBundleById } from "./selectBundleById";
import { type CheckoutItemInput } from "../utils/types";
import { type CheckoutItem } from "../utils/types";

export function selectCheckoutItems(items: CheckoutItemInput[],
): Promise<CheckoutItem[]> {
    return Promise.all(
        items.map((item) => {
            const itemId = Number(item.id);

            if (item.type === "product") {
                return selectProductById(itemId).then((product) => {
                    if (!product || !product.active) {
                        return Promise.reject({
                            status: 400,
                            msg: "One or more items are unavailable",
                        });
                    }
                    return {
                        type: "product" as const,
                        quantity: item.quantity,
                        product,
                    };
                });
            }

            return selectBundleById(itemId).then((bundle) => {
                if (!bundle || !bundle.active) {
                    return Promise.reject({
                        status: 400,
                        msg: "One or more items are unavailable",
                    });
                }
                return {
                    type: "bundle" as const,
                    quantity: item.quantity,
                    bundle,
                };
            });
        }),
    );
}