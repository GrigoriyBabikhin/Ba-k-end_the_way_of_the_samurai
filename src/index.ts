import express, {Response} from 'express'
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody, RequestWithQuery} from "./types";
import {CrateCourseModel} from "./models/CrateCourseModel";
import {UpdateCourseModel} from "./models/UpdateCourseModel";
import {QueryCoursesModel} from "./models/QueryCoursesModel";
import {CourseViewModel} from "./models/CourseViewModel";
import {URIParamsCourseIdModel} from "./models/URIParamsCourseIdModel";

export const app = express()
const port = 3003
const jsonBodyMiddleware = express.json()
export const HTTP_STATUSES = {
    OK_200: 200,
    CREATED_201: 201,
    NO_CONTENT_204: 204,
    BAD_REQUEST_400: 400,
    NOT_FOUND_404: 404
}

app.use(jsonBodyMiddleware)

type CourseType = {
    id: number
    title: string
    studentsCount: number
}

const db: { courses: CourseType[] } = {
    courses: [
        {id: 1, title: 'front-end', studentsCount: 10},
        {id: 2, title: 'back-end', studentsCount: 10},
        {id: 3, title: 'automation qa', studentsCount: 10},
        {id: 4, title: 'devops', studentsCount: 10}
    ]
}

const getCourseViewModel = (dbCourse: CourseType): CourseViewModel => {
    return {
        id: dbCourse.id,
        title: dbCourse.title
    }

}

app.get('/courses', (req: RequestWithQuery<QueryCoursesModel>,
                     res: Response<CourseViewModel[]>) => {
    let foundCourses = db.courses;

    if (req.query.title) {
        foundCourses = foundCourses
            .filter(c => c.title.indexOf(req.query.title) > -1)
    }

    res.json(foundCourses.map(getCourseViewModel))
})

app.get('/courses/:id', (req: RequestWithParams<URIParamsCourseIdModel>,
                         res: Response<CourseViewModel>) => {
    const coursesId = Number(req.params.id);

    const foundCourse = db.courses.find(c => c.id === coursesId);

    if (!foundCourse) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }
    res.json(getCourseViewModel(foundCourse))
})

app.post('/courses', (req: RequestWithBody<CrateCourseModel>,
                      res: Response<CourseViewModel>) => {
    const checkingForAnEmptyLine = !req.body.title || req.body.title.replace(/\s/g, '').length === 0;

    if (checkingForAnEmptyLine) {
        res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
        return;
    }

    const createdCourse: CourseType = {
        id: Number(new Date()),
        title: req.body.title,
        studentsCount: 0
    };
    db.courses.push(createdCourse)
    res
        .status(HTTP_STATUSES.CREATED_201)
        .json(getCourseViewModel(createdCourse))
})

app.delete('/courses/:id', (req: RequestWithParams<URIParamsCourseIdModel>, res) => {
    const coursesId = Number(req.params.id);
    const foundCourse = db.courses.find(c => c.id === coursesId);
    if (!foundCourse) {
        res.sendStatus(404)
        return;
    }

    db.courses = db.courses.filter(c => c.id !== coursesId);

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

app.put('/courses/:id', (req: RequestWithParamsAndBody<URIParamsCourseIdModel, UpdateCourseModel>,
                         res) => {
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



