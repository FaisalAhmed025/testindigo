import moment from "moment";
import {z} from "zod";
import schema from "../schema";

// Define regex pattern for yyyy-mm-dd format
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// Call dateStringValidator function for departureDate


const searchSchema = z.object({
    body: z
        .object({
            adultCount: z
                .number()
                .int()
                .positive()
                .min(1)
                .refine(
                    (count) => {
                        return count > 0; // Ensure adultCount is greater than zero
                    },
                    {
                        message: 'adultCount must be greater than zero'
                    }
                ),
            childCount: z.number().int().nonnegative().min(0),
            infantCount: z.number().int().nonnegative().min(0),
            cabin: schema.cabinValidator,
            vendorPref: z.array(schema.VendorPrefSchema), // Array of strings
            studentFare: z.boolean(),
            umrahFare: z.boolean(),
            seamanFare: z.boolean(),
            segmentsList: z.array(schema.routeSchema) // Array of segments
        })
        .refine(
            ({adultCount, infantCount}) => {
                // Ensure infantCount is not greater than adultCount
                return infantCount <= adultCount;
            },
            {
                message: 'infantCount cannot be greater than adultCount'
            }
        )
        .and(schema.totalCountValidator)
});

export default searchSchema;
