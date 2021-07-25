type StripType = { awsRequestId: string };

/**
 * Removes the awsRequestId from objects (usually the Error response bodies)
 * As there is no need to include them in every test.
 *
 * @param toStrip the class from which to strip (delete) the awsRequestId property
 */
export function stripAwsRequestId(toStrip: StripType): void {
    delete toStrip.awsRequestId;
}
