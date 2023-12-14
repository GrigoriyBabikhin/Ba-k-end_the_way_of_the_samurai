import express from 'express'

export const app = express()
const port = 3003
const jsonBodyMiddleware = express.json()
export const HTTP_STATUSES = {
    OK_200 : 200,
    CREATED_201: 201,
    NO_CONTENT_204: 204,
    BAD_REQUEST_400: 400,
    NOT_FOUND_404: 404
}

app.use(jsonBodyMiddleware)

const db = {
    courses: [
        {id: 1, title: 'front-end'},
        {id: 2, title: 'back-end'},
        {id: 3, title: 'automation qa'},
        {id: 4, title: 'devops'}
    ]
}

app.get('/courses', (req, res) => {
    let foundCourse = db.courses
    if (req.query.title) {
        foundCourse = foundCourse
            .filter(c => c.title.indexOf(req.query.title as string) > -1)
    }

    res.json(foundCourse)
})

app.get('/courses/:id', (req, res) => {
    const coursesId = Number(req.params.id);

    const foundCourse = db.courses.find(c => c.id === coursesId);

    if (!foundCourse) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.json(foundCourse)
})

app.post('/courses', (req, res) => {
    const checkingForAnEmptyLine = !req.body.title || req.body.title.replace(/\s/g, '').length === 0;

    if (checkingForAnEmptyLine) {
        res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
        return;
    }

    const createdCourse = {
        id: Number(new Date()),
        title: req.body.title
    };
    db.courses.push(createdCourse)
    res
        .status(HTTP_STATUSES.CREATED_201)
        .json(createdCourse)
})

app.delete('/courses/:id', (req, res) => {
    const coursesId = Number(req.params.id);
    const foundCourse = db.courses.find(c => c.id === coursesId);
    if (!foundCourse) {
        res.sendStatus(404)
        return;
    }

    db.courses = db.courses.filter(c => c.id !== coursesId);

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

app.put('/courses/:id', (req, res) => {
    const coursesId = Number(req.params.id);
    const foundCourse = db.courses.find(c => c.id === coursesId);
    const checkingForAnEmptyLine = !req.body.title || req.body.title.replace(/\s/g, '').length === 0

    if (checkingForAnEmptyLine) {
        res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
        return;
    }

    if (!foundCourse) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }

    foundCourse.title = req.body.title;

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

app.delete('/__test__/data', (req, res) => {
    db.courses = [];
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})



