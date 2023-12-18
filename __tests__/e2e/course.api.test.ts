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
            .get('/courses/9999')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it(`shouldn't create course with incorrect import data`, async () => {
        await request(app)
            .post('/courses')
            .send({title: ' '})
            .expect(HTTP_STATUSES.BAD_REQUEST_400)//если создаем невалидные данные получаем отказ.

        await request(app)
            .get('/courses')
            .expect(HTTP_STATUSES.OK_200, [])//проверяем что пусто

    })

    let createdCourse1: any = null
    it(`shouldn create course with correct import data`, async () => {
        const createResponse = await request(app)
            .post('/courses')
            .send({title: 'it-incubator course'})
            .expect(HTTP_STATUSES.CREATED_201)

        createdCourse1 = createResponse.body;

        expect(createdCourse1).toEqual({
            id: expect.any(Number),
            title: 'it-incubator course'
        })

        await request(app)
            .get('/courses')
            .expect(HTTP_STATUSES.OK_200, [createdCourse1])
    })

    let createdCourse2: any = null;
    it(`create one more course`, async () => {
        const createResponse = await request(app)
            .post('/courses')
            .send({title: 'it-incubator course 2'})
            .expect(HTTP_STATUSES.CREATED_201)

        createdCourse2 = createResponse.body;

        expect(createdCourse2).toEqual({
            id: expect.any(Number),
            title: 'it-incubator course 2'
        })

        await request(app)
            .get('/courses')
            .expect(HTTP_STATUSES.OK_200, [createdCourse1, createdCourse2])
    })

    it(`shouldn't update course with incorrect import data`, async () => {
        await request(app)
            .put('/courses/' + createdCourse1.id)
            .send({title: ''})
            .expect(HTTP_STATUSES.BAD_REQUEST_400)//невалидное обновление не пройдет

        await request(app)
            .get('/courses/' + createdCourse1.id)
            .expect(HTTP_STATUSES.OK_200, createdCourse1)//проверяем что курс действительно не изменился
    })

    it(`shouldn't update course that not exist`, async () => {
        await request(app)
            .put('/courses/' + -100)
            .send({title: 'good title'})
            .expect(HTTP_STATUSES.NOT_FOUND_404)

    })

    it(`should update course with correct input data`, async () => {
        await request(app)
            .put('/courses/' + createdCourse1.id)
            .send({title: 'good new title'})
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get('/courses/' + createdCourse1.id)
            .expect(HTTP_STATUSES.OK_200, {
                ...createdCourse1,
                title: 'good new title'//проверяем что кус обновился
            })

        await request(app)
            .get('/courses/' + createdCourse2.id)
            .expect(HTTP_STATUSES.OK_200, createdCourse2//курс не изменился
            )
    })

    it(`should delete both courses`, async () => {
        await request(app)
            .delete('/courses/' + createdCourse1.id)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get('/courses/' + createdCourse1.id)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        await request(app)
            .delete('/courses/' + createdCourse2.id)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get('/courses/' + createdCourse2.id)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        await request(app)
            .get('/courses')
            .expect(HTTP_STATUSES.OK_200, [])
    })
})