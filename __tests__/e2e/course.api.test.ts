import request from 'supertest'
import {app, HTTP_STATUSES} from "../../src";

describe('/course', () => {
    beforeAll(async () => {
        await request(app).delete('/__test__/data')
    })

    it('should return 200 and empty array', async () => {
        await request(app)
            .get('/courses')
            .expect(HTTP_STATUSES.OK_200, [])
    })

    it('should return 404 for not existing course', async () => {
        await request(app)
            .get('/courses/9')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it(`shouldn't create course with incorrect import data`, async () => {
        await request(app)
            .post('/courses')
            .send({title: ' '})
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        await request(app)
            .get('/courses')
            .expect(HTTP_STATUSES.OK_200, [])

    })

    it(`shouldn create course with correct import data`, async () => {
            const createResponse = await request(app)
                .post('/courses')
                .send({title: 'it-incubator course'})
                .expect(HTTP_STATUSES.CREATED_201)

            const createdCourse = createResponse.body;

            expect(createdCourse).toEqual({
                id: expect.any(Number),
                title: 'it-incubator course'
            })

            await request(app)
                .get('/courses')
                .expect(HTTP_STATUSES.OK_200, [createdCourse])
        })

})