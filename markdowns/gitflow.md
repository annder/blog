# Git 工作流

## Featrue Branching 流派

Featrue Branching 工作流主要的用途是用来做边开发边发布，边开发边更新，边更新边修复。

这个是用来做快速开发，并且适用于中小团队的开发策略，这样的做法并不会影响开发效率。

### 概念

它的核心工作流分为两种：

- 任何新 featrue 以及 bug 全部是由一个分支来搞定的。
- 分支的代码搞定之后，删掉开发的分支，然后合并到 master 上面去。

---

它虽然和传统的一个分支和多个任务相悖论，但是它解决了一个人员只能开发一个模块的方案。

如果一个分支开发完毕之后，你可以直接让同事帮你 review 一下，接着既可以合并到主分支了。

---

### 使用

- 创建一个分支：

```bash
git checkout -b books
```

- Push request

接下来就是着手开发的事项了，当开发完成之后，就可`pull request`即可。

```bash
git push origin books
```

- 切换到主分支

这个时候同事在开发代码的时候，必然会 pull 一次代码，此时它会`review`一次代码。如果不错的话，那么就会直接合并到主分支上。

```bash
git checkout master
git pull # 拉取代码
git merge master # 合并到master这个分支上
```

## Git flow 流派

### 概念

它分为五种分支，分别代表不同的工作分支。

- Master

是指将所有的正式版本代码都放在此分支上面去了，它是一个作为上线，并且稳定的上线分支。

- Develop

是指存储所有开发过的代码，作为开发版本的分支。它会克隆 Master 分支上的代码，并且会合并 feature 分支的代码。

- Feature

是指团队人员开发的分支， 最终会被合并到 Develop 分支上。

- Release

是指即将发布的版本分支，它是用来做测试和修改 Bug 的一个分支。此分支的生命周期非常短，结束后会合并到 Master 和 Develop 分支上。

- HotFix

是指在线上的修复和 Release 上的修复分支。

---

### 使用

使用`git flow`命令来创建一个 git 流。

创建一个`git flow`流：

```bash
git flow init
```

- 使用 featrue 分支

开启一个 featrue 分支，并且切换到分支上：

```bash
git flow featrue start [featrue name]
```

完成 featrue 分支，并切换到 develop 分支上：

```bash
git flow featrue finish  [featrue name]
```

- 使用 hotfix 分支

开启一个 hotfix 分支，并且切换到上面去：

```bash
git flow hotfix start [hotfix name]
```

完成 hotfix 分支，并且回归到 develop 和 master 分支上：

```bash
git flow hotfix finish [hotfix name]
```

- 使用 realease 分支

开启一个 release 分支，并且切换到 release 分支上去。

```bash
git flow release start [release name]
```

完成 release 分支，并回归到 develop 分支和 master 分支上。

```bashs
git flow release finish [release name]
```

---

## Commit message 规范

Commit message 分为几个部分，这几个部分有助于下次开发，更好地编写。

```
<type>(scope):<subject>
<BLANK></BLANK>
<body>(break changes)
<BLANK></BLANK>
<footer>
```

它分别对应的是：

- type - 需要提交的类型
- BLANK LINK - 空行
- body - 需要提交的内容
- footer - 脚部

---

### type

```bash
# 主type
- feat 增加的新功能
- fix 修复的一些bug

# 次type
- refactor 重构
- revert 还原message
- docs 写文档
- test 测试
```

### scope

它约束的是改动代码的范围，例如修改`wrapper/dao`层面的代码。

### body

它是指改动的动机，以及修改动机。

### break changes

是指是否产生破坏性的修改，例如接口的修改，接口参数的修改、迁移等...
